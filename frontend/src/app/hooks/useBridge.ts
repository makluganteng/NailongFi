import { ethers } from 'ethers';
import { config } from '@/lib/config';
import { insertBridgeTransaction } from '@/lib/transactionHistory';

// Bridge state interface for tracking progress
export interface BridgeState {
    status: 'idle' | 'approving' | 'bridging' | 'success' | 'error';
    message: string;
}

// Helper function to wait for transaction confirmation
const waitForTransaction = async (txHash: string) => {
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/Bh1ANap4EQrTxY5-g3y5uJgKwjIsctJ-");

    console.log(`Waiting for transaction ${txHash} to be mined...`);

    // Wait for the transaction to be mined
    const receipt = await provider.waitForTransaction(txHash);

    if (!receipt) {
        throw new Error(`Transaction ${txHash} failed to be mined`);
    }

    console.log(`Transaction ${txHash} confirmed in block ${receipt.blockNumber}`);
    return receipt;
};

interface BridgeParams {
    tokenAddress: string;
    amount: string;
    sourceNetwork: number;
    destinationNetwork: number;
    callAddress: string;
    fallbackAddress: string;
    forceUpdateGlobalExitRoot: boolean;
}

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

const BRIDGE_ABI = [
    "function bridgeAsset(uint32 destinationNetwork, address destinationAddress, uint256 amount, address token, bool forceUpdateGlobalExitRoot, bytes permitData) external payable"
];



export const bridgeAsset = async (
    params: BridgeParams,
    sendTransaction: any,
    walletAddress: string,
    onStateChange?: (state: BridgeState) => void
) => {
    try {
        // Bridge contract address on Sepolia
        const bridgeAddress = "0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582";
        const vaultAddress = config.NAILONG_VAULT_ADDRESS;

        console.log(params.amount, "amount");

        const bridgeInterface = new ethers.Interface(BRIDGE_ABI);
        const callData = bridgeInterface.encodeFunctionData('bridgeAsset', [
            params.destinationNetwork,
            vaultAddress,
            params.amount,
            params.tokenAddress,
            params.forceUpdateGlobalExitRoot,
            "0x"
        ]);

        console.log("Bridge parameters:", {
            destinationNetwork: params.destinationNetwork,
            destinationAddress: vaultAddress,
            amount: params.amount,
            token: params.tokenAddress,
            forceUpdateGlobalExitRoot: params.forceUpdateGlobalExitRoot,
            permitData: "0x"
        });

        let result;

        if (params.tokenAddress === config.ETH_SEPOLIA_ADDRESS) {
            console.log("Sending transaction to bridge for ETH");
            onStateChange?.({ status: 'bridging', message: 'Preparing bridge transaction...' });

            result = await sendTransaction(
                {
                    to: bridgeAddress,
                    data: callData,
                    value: BigInt(params.amount)
                },
                {
                    address: walletAddress
                }
            );

            onStateChange?.({ status: 'bridging', message: 'Bridge transaction submitted! Waiting for confirmation...' });

        } else {
            console.log("Approve the WETH to the bridge");
            onStateChange?.({ status: 'approving', message: 'Approving token for bridge...' });

            const erc20Interface = new ethers.Interface(ERC20_ABI);
            const approveData = erc20Interface.encodeFunctionData('approve', [bridgeAddress, params.amount]);
            console.log("Approve data:", approveData);

            result = await sendTransaction(
                {
                    to: params.tokenAddress,
                    data: approveData,
                    value: BigInt(0)
                },
                {
                    address: walletAddress
                }
            );

            console.log("Approve transaction result:", result);
            onStateChange?.({ status: 'approving', message: 'Approval submitted! Waiting for confirmation...' });

            // wait for the approve to be mined
            await waitForTransaction(result.hash);
            onStateChange?.({ status: 'approving', message: 'Approval confirmed! Preparing bridge transaction...' });

            console.log("Sending transaction to bridge");
            onStateChange?.({ status: 'bridging', message: 'Sending bridge transaction...' });

            result = await sendTransaction(
                {
                    to: bridgeAddress,
                    data: callData,
                    value: BigInt(0)
                },
                {
                    address: walletAddress
                }
            );

            onStateChange?.({ status: 'bridging', message: 'Bridge transaction submitted! Waiting for confirmation...' });
            // wait for the bridge to be mined
            await waitForTransaction(result.hash);
        }

        console.log("Bridge transaction result:", result);

        // Record successful bridge transaction
        try {
            await insertBridgeTransaction({
                userAddress: walletAddress,
                amount: params.amount,
                tokenAddress: params.tokenAddress,
                sourceNetwork: params.sourceNetwork,
                destinationNetwork: params.destinationNetwork,
                transactionHash: result.hash || result.transactionHash || 'unknown',
                depositCount: 0
            });
            console.log('Transaction recorded in database');
        } catch (dbError) {
            console.error('Failed to record transaction in database:', dbError);
            // Don't fail the bridge transaction if database recording fails
        }

        onStateChange?.({ status: 'success', message: 'Bridge transaction successful!' });
        return result;
    } catch (error) {
        console.error("Bridge error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        onStateChange?.({ status: 'error', message: `Bridge failed: ${errorMessage}` });
        throw error;
    }
};

const VAULT_BRIDGE_ABI = [
    "function depositGasTokenAndBridge(address destinationAddress, uint32 destinationNetworkId, bool forceUpdateGlobalExitRoot) external payable"
]

export const depositGasTokenAndBridge = async (params: BridgeParams, sendTransaction: any, walletAddress: string, onStateChange?: (state: BridgeState) => void) => {
    try {
        const vaultBridgeAddress = config.VAULT_BRIDGE_ADDRESS;
        const vaultAddress = config.NAILONG_VAULT_ADDRESS

        console.log("Preparing deposit and bridge transaction...");
        onStateChange?.({ status: 'bridging', message: 'Preparing deposit and bridge transaction...' });

        // Deposit the gas token to the vault
        const bridgeInterface = new ethers.Interface(VAULT_BRIDGE_ABI);
        const callData = bridgeInterface.encodeFunctionData('depositGasTokenAndBridge', [
            vaultAddress,
            params.destinationNetwork,
            params.forceUpdateGlobalExitRoot
        ]);

        console.log("Sending deposit and bridge transaction...");
        onStateChange?.({ status: 'bridging', message: 'Sending deposit and bridge transaction...' });

        const result = await sendTransaction(
            {
                to: vaultBridgeAddress,
                data: callData,
                value: BigInt(params.amount)
            },
            {
                address: walletAddress
            }
        );

        onStateChange?.({ status: 'bridging', message: 'Transaction submitted! Waiting for confirmation...' });
        await waitForTransaction(result.hash);

        // Extract depositCount from BridgeEvent logs
        let depositCount: number | null = null;
        try {
            // Get the provider from the transaction result or use a default one
            const provider = result.provider || new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/Bh1ANap4EQrTxY5-g3y5uJgKwjIsctJ-");
            depositCount = await extractDepositCountFromLogs(result.hash, provider);

            if (depositCount !== null) {
                console.log('Successfully extracted depositCount:', depositCount);
            } else {
                console.log('Could not extract depositCount from logs');
            }
        } catch (error) {
            console.error('Error extracting depositCount:', error);
            // Continue with the transaction even if we can't extract depositCount
        }

        // Record successful bridge transaction with depositCount
        try {
            await insertBridgeTransaction({
                userAddress: walletAddress,
                amount: params.amount,
                tokenAddress: config.ETH_SEPOLIA_ADDRESS,
                sourceNetwork: params.sourceNetwork,
                destinationNetwork: params.destinationNetwork,
                transactionHash: result.hash || result.transactionHash || 'unknown',
                depositCount: depositCount || undefined
            });
            console.log('Transaction recorded in database with depositCount:', depositCount);
        } catch (dbError) {
            console.error('Failed to record transaction in database:', dbError);
            // Don't fail the bridge transaction if database recording fails
        }

        onStateChange?.({ status: 'success', message: 'Deposit and bridge successful!' });

        return result;
    } catch (error) {
        console.error("Deposit gas token and bridge error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        onStateChange?.({ status: 'error', message: `Deposit and bridge failed: ${errorMessage}` });
        throw error;
    }
}

// Function to extract depositCount from BridgeEvent logs
const extractDepositCountFromLogs = async (transactionHash: string, provider: any): Promise<number | null> => {
    try {
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (!receipt) {
            console.log('Transaction receipt not found');
            return null;
        }

        // BridgeEvent topic: keccak256("BridgeEvent(uint8,uint32,address,uint32,address,uint256,bytes,uint32)")
        const bridgeEventTopic = '0x501781209a1f8899323b96b4ef08b168df93e0a90c673d1e4cce39366cb62f9b';

        // Find logs with the BridgeEvent topic
        const bridgeLogs = receipt.logs.filter((log: any) => log.topics[0] === bridgeEventTopic);

        if (bridgeLogs.length === 0) {
            console.log('No BridgeEvent logs found');
            return null;
        }

        // Parse the first BridgeEvent log
        const log = bridgeLogs[0];

        // BridgeEvent parameters: (uint8 leafType, uint32 originNetwork, address originAddress, uint32 destinationNetwork, address destinationAddress, uint256 amount, bytes metadata, uint32 depositCount)
        // We need to decode the data to get the depositCount (last parameter)

        // The data field contains the non-indexed parameters
        // Since depositCount is the last parameter, we need to decode it
        // For simplicity, we'll use ethers.js to decode the data

        // Create an interface for the BridgeEvent
        const bridgeEventInterface = new ethers.Interface([
            'event BridgeEvent(uint8 leafType, uint32 originNetwork, address originAddress, uint32 destinationNetwork, address destinationAddress, uint256 amount, bytes metadata, uint32 depositCount)'
        ]);

        // Parse the log
        const parsedLog = bridgeEventInterface.parseLog(log);
        if (!parsedLog) {
            console.log('Failed to parse BridgeEvent log');
            return null;
        }

        const depositCount = parsedLog.args[7]; // depositCount is the 8th parameter (0-indexed)

        console.log('Extracted depositCount:', depositCount.toString());
        return Number(depositCount);

    } catch (error) {
        console.error('Error extracting depositCount from logs:', error);
        return null;
    }
};