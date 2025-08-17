import express, { Request, Response } from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import NailongMain from './abi/NailongMain.json';
import dotenv from 'dotenv';
import { storeWithdrawHistory, getUserWithdrawHistory } from './supabase/supabase';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Ethers clients
const provider = new ethers.JsonRpcProvider("https://rpc.tatara.katanarpc.com/");

// Contract configuration
const CONTRACT_ADDRESS = "0x9758163C44D813FEc380798A11CCf4531A3Fa3D3";
const CONTRACT_ABI = NailongMain.abi;

// Get operator wallet
const getWallet = () => {
    const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY;

    if (!operatorPrivateKey) {
        throw new Error("OPERATOR_PRIVATE_KEY environment variable is not set");
    }

    return new ethers.Wallet(operatorPrivateKey, provider);
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Withdrawal endpoint
app.post('/api/withdraw', async (req: Request, res: Response) => {
    try {
        const {
            user,
            amount,
            destinationNetwork,
            destinationAddress,
            token,
            forceUpdateGlobalExitRoot = false,
            permitData = '0x'
        } = req.body;

        console.log('Request:', req.body)

        // Validate required fields
        if (!amount || !destinationAddress || !token) {
            return res.status(400).json({
                error: 'Missing required fields: amount, destinationNetwork, destinationAddress, token'
            });
        }

        // Validate amount is positive
        if (ethers.parseEther(amount) <= 0) {
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

        // Get wallet
        const wallet = getWallet();
        const account = wallet.address;

        // Create contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        // Check if the account is admin
        const adminAddress = await contract.ADMIN_ADDRESS();

        if (adminAddress !== account) {
            return res.status(403).json({
                error: 'Unauthorized: Only admin can execute withdrawals'
            });
        }

        // Check vault balance
        const vaultAddress = await contract.VAULT_ADDRESS();
        const wethAddress = await contract.WETH_ADDRESS();

        // Create WETH contract instance
        const wethContract = new ethers.Contract(wethAddress, [
            {
                inputs: [{ name: 'account', type: 'address' }],
                name: 'balanceOf',
                outputs: [{ name: '', type: 'uint256' }],
                stateMutability: 'view',
                type: 'function'
            }
        ], provider);

        const vaultBalance = await wethContract.balanceOf(vaultAddress);

        if (vaultBalance < ethers.parseEther(amount)) {
            return res.status(400).json({
                error: 'Insufficient vault balance',
                requested: amount.toString(),
                available: vaultBalance.toString()
            });
        }

        console.log('Available functions:', Object.keys(contract.interface));

        // Execute the transaction using the contract's interface
        const tx = await contract.requestWithdraw(
            user,
            ethers.parseEther(amount),
            destinationNetwork,        // Add this back
            destinationAddress,
            token,
            forceUpdateGlobalExitRoot,
            permitData
        );

        console.log(`Withdrawal transaction hash: ${tx.hash}`);

        // Store withdraw history in Supabase
        const withdrawHistoryData = {
            user_address: user,
            amount: amount,
            token_address: token,
            transaction_hash: tx.hash,
            destination_network: destinationNetwork
        };

        const { error: dbError } = await storeWithdrawHistory(withdrawHistoryData);
        if (dbError) {
            console.log('Warning: Failed to store withdraw history:', dbError);
            // Don't fail the withdrawal if DB storage fails
        }

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        res.json({
            success: true,
            transactionHash: tx.hash,
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
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const vaultAddress = await contract.VAULT_ADDRESS();
        const wethAddress = await contract.WETH_ADDRESS();

        const wethContract = new ethers.Contract(wethAddress, [
            {
                inputs: [{ name: 'account', type: 'address' }],
                name: 'balanceOf',
                outputs: [{ name: '', type: 'uint256' }],
                stateMutability: 'view',
                type: 'function'
            }
        ], provider);

        const balance = await wethContract.balanceOf(CONTRACT_ADDRESS);

        res.json({
            contractAddress: CONTRACT_ADDRESS,
            vaultAddress,
            wethAddress,
            balance: ethers.formatEther(balance)
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
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const adminAddress = await contract.ADMIN_ADDRESS();
        const bridgeAddress = await contract.BRIDGE_ADDRESS();
        const vaultAddress = await contract.VAULT_ADDRESS();
        const wethAddress = await contract.WETH_ADDRESS();

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

// Get user's withdraw history endpoint
app.get('/api/withdraw-history/:userAddress', async (req: Request, res: Response) => {
    try {
        const { userAddress } = req.params;

        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
            return res.status(400).json({
                error: 'Invalid user address format'
            });
        }

        const { data, error } = await getUserWithdrawHistory(userAddress);

        if (error) {
            return res.status(500).json({
                error: 'Database error',
                message: error.message
            });
        }

        res.json({
            success: true,
            withdrawHistory: data || [],
            message: 'Withdraw history retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching withdraw history:', error);
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
    console.log(`📜 Withdraw history: http://localhost:${PORT}/api/withdraw-history/:userAddress`);
});

export default app; 