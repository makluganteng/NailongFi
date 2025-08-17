import express, { Request, Response } from 'express';
import cors from 'cors';
import { createPublicClient, http, createWalletClient, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import NailongMain from './abi/NailongMain.json';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Viem clients
const publicClient = createPublicClient({
    transport: http("https://rpc.tatara.katanarpc.com/")
});

// Contract configuration
const CONTRACT_ADDRESS = "0x5d7F21089decc3145C603eC3cdC4D6330dE89DF2" as `0x${string}`;
const CONTRACT_ABI = NailongMain.abi;

// Get operator wallet client
const getWalletClient = () => {
    const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY;

    if (!operatorPrivateKey) {
        throw new Error("OPERATOR_PRIVATE_KEY environment variable is not set");
    }

    const cleanPrivateKey = operatorPrivateKey.startsWith('0x')
        ? operatorPrivateKey.slice(2)
        : operatorPrivateKey;

    const account = privateKeyToAccount(`0x${cleanPrivateKey}` as `0x${string}`);

    return createWalletClient({
        account,
        transport: http("https://rpc.tatara.katanarpc.com/")
    });
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Withdrawal endpoint
app.post('/api/withdraw', async (req: Request, res: Response) => {
    try {
        const {
            amount,
            destinationNetwork,
            destinationAddress,
            token,
            forceUpdateGlobalExitRoot = false,
            permitData = '0x'
        } = req.body;

        // Validate required fields
        if (!amount || !destinationNetwork || !destinationAddress || !token) {
            return res.status(400).json({
                error: 'Missing required fields: amount, destinationNetwork, destinationAddress, token'
            });
        }

        // Validate amount is positive
        if (BigInt(amount) <= 0) {
            return res.status(400).json({
                error: 'Amount must be greater than 0'
            });
        }

        // Validate destination address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(destinationAddress)) {
            return res.status(400).json({
                error: 'Invalid destination address format'
            });
        }

        console.log(`Processing withdrawal request:`, {
            amount: amount.toString(),
            destinationNetwork,
            destinationAddress,
            token,
            forceUpdateGlobalExitRoot,
            permitData
        });

        // Get wallet client
        const walletClient = getWalletClient();
        const account = walletClient.account;

        // Check if the account is admin
        const adminAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'ADMIN_ADDRESS',
        });

        if (adminAddress !== account.address) {
            return res.status(403).json({
                error: 'Unauthorized: Only admin can execute withdrawals'
            });
        }

        // Check vault balance
        const vaultAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'VAULT_ADDRESS',
        }) as `0x${string}`;

        const wethAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'WETH_ADDRESS',
        }) as `0x${string}`;

        const vaultBalance = await publicClient.readContract({
            address: wethAddress,
            abi: [
                {
                    inputs: [{ name: 'account', type: 'address' }],
                    name: 'balanceOf',
                    outputs: [{ name: '', type: 'uint256' }],
                    stateMutability: 'view',
                    type: 'function'
                }
            ],
            functionName: 'balanceOf',
            args: [vaultAddress]
        });

        if (vaultBalance < BigInt(amount)) {
            return res.status(400).json({
                error: 'Insufficient vault balance',
                requested: amount.toString(),
                available: vaultBalance.toString()
            });
        }

        // Simulate the contract call first
        const { request } = await publicClient.simulateContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'requestWithdraw',
            args: [
                BigInt(amount),
                destinationNetwork,
                destinationAddress as `0x${string}`,
                token as `0x${string}`,
                forceUpdateGlobalExitRoot,
                permitData as `0x${string}`
            ],
            account: account.address,
        });

        // Execute the transaction
        const hash = await walletClient.writeContract(request);
        console.log(`Withdrawal transaction hash: ${hash}`);

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        res.json({
            success: true,
            transactionHash: hash,
            blockNumber: receipt.blockNumber.toString(),
            message: 'Withdrawal request processed successfully'
        });

    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Get vault balance endpoint
app.get('/api/vault-balance', async (req: Request, res: Response) => {
    try {
        const vaultAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'VAULT_ADDRESS',
        }) as `0x${string}`;

        const wethAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'WETH_ADDRESS',
        }) as `0x${string}`;

        const balance = await publicClient.readContract({
            address: wethAddress,
            abi: [
                {
                    inputs: [{ name: 'account', type: 'address' }],
                    name: 'balanceOf',
                    outputs: [{ name: '', type: 'uint256' }],
                    stateMutability: 'view',
                    type: 'function'
                }
            ],
            functionName: 'balanceOf',
            args: [CONTRACT_ADDRESS]
        });

        res.json({
            contractAddress: CONTRACT_ADDRESS,
            vaultAddress,
            wethAddress,
            balance: parseEther(balance.toString())
        });

    } catch (error) {
        console.error('Error fetching vault balance:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Get contract info endpoint
app.get('/api/contract-info', async (req: Request, res: Response) => {
    try {
        const adminAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'ADMIN_ADDRESS',
        });

        const bridgeAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'BRIDGE_ADDRESS',
        });

        const vaultAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'VAULT_ADDRESS',
        });

        const wethAddress = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'WETH_ADDRESS',
        });

        res.json({
            contractAddress: CONTRACT_ADDRESS,
            adminAddress,
            bridgeAddress,
            vaultAddress,
            wethAddress
        });

    } catch (error) {
        console.error('Error fetching contract info:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`💸 Withdrawal endpoint: http://localhost:${PORT}/api/withdraw`);
    console.log(`💰 Vault balance: http://localhost:${PORT}/api/vault-balance`);
    console.log(`📋 Contract info: http://localhost:${PORT}/api/contract-info`);
});

export default app; 