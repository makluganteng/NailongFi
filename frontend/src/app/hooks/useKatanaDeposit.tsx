'use client';

import { useState } from 'react';
import { bridgeAsset, depositGasTokenAndBridge } from './useBridge';
import { useSendTransaction, useSignTransaction, useWallets } from '@privy-io/react-auth';
import { parseUnits } from 'viem';
import { config } from '@/lib/config';
import { insertBridgeTransaction } from '@/lib/transactionHistory';

interface KatanaDepositParams {
    tokenAddress: string;
    amount: string;
    sourceNetwork: number; // 0 for Sepolia
    destinationNetwork: number; // 29 for Katana
    callAddress: string; // Katana contract address
    fallbackAddress: string; // User's address on Katana
}

export const useKatanaDeposit = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const { signTransaction } = useSignTransaction();
    const { sendTransaction } = useSendTransaction();
    const { wallets } = useWallets();

    const depositToKatana = async (params: KatanaDepositParams) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        setTxHash(null);
        setIsPending(false);

        try {
            // Validate parameters
            if (!params.tokenAddress || !params.amount || !params.callAddress || !params.fallbackAddress) {
                throw new Error('Missing required parameters');
            }

            if (!wallets || wallets.length === 0) {
                throw new Error('No wallet available');
            }

            // Convert amount to wei (18 decimals for ETH, 6 for USDC)
            const decimals = params.tokenAddress === config.ETH_SEPOLIA_ADDRESS || params.tokenAddress === config.WETH_SEPOLIA_ADDRESS ? 18 : 6;
            const amountInWei = parseUnits(params.amount, decimals);

            console.log('Original amount:', params.amount);
            console.log('Decimals:', decimals);
            console.log('Amount in wei:', amountInWei.toString());

            // Set default networks if not provided
            const depositParams = {
                ...params,
                amount: amountInWei.toString(),
                sourceNetwork: params.sourceNetwork || 0, // Sepolia
                destinationNetwork: params.destinationNetwork || 29, // Katana
                forceUpdateGlobalExitRoot: true
            };

            console.log('Depositing to Katana:', depositParams);

            let result;
            let currentToastId: string | null = null;

            result = await depositGasTokenAndBridge(
                depositParams,
                sendTransaction,
                wallets[0].address,
                (state) => {
                    // Handle bridge state changes and show toasts
                    switch (state.status) {
                        case 'approving':
                            // Remove any existing toast and show approval toast
                            if (currentToastId) {
                                (window as any).removeToast?.(currentToastId);
                            }
                            currentToastId = (window as any).showToast?.({
                                type: 'loading',
                                title: 'Approving Token',
                                message: state.message
                            });
                            break;
                        case 'bridging':
                            // Update existing toast or create new one
                            if (currentToastId) {
                                (window as any).updateToast?.(currentToastId, {
                                    type: 'loading',
                                    title: 'Bridging Asset',
                                    message: state.message
                                });
                            } else {
                                currentToastId = (window as any).showToast?.({
                                    type: 'loading',
                                    title: 'Bridging Asset',
                                    message: state.message
                                });
                            }
                            break;
                        case 'success':
                            // Update the loading toast to success and auto-hide it
                            if (currentToastId) {
                                (window as any).updateToast?.(currentToastId, {
                                    type: 'success',
                                    title: 'Bridge Successful!',
                                    message: state.message
                                });
                                // Remove the toast after a short delay
                                setTimeout(() => {
                                    (window as any).removeToast?.(currentToastId);
                                }, 3000);
                                currentToastId = null;
                            }
                            break;
                        case 'error':
                            // Update the loading toast to error and auto-hide it
                            if (currentToastId) {
                                (window as any).updateToast?.(currentToastId, {
                                    type: 'error',
                                    title: 'Bridge Failed',
                                    message: state.message
                                });
                                // Remove the toast after a short delay
                                setTimeout(() => {
                                    (window as any).removeToast?.(currentToastId);
                                }, 5000);
                                currentToastId = null;
                            }
                            break;
                    }
                }
            );

            console.log('Bridge result:', result);

            // Set pending state and transaction hash
            setIsPending(true);
            setTxHash(result.hash || 'Transaction submitted');
            setSuccess(true);

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error depositing to Katana:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setError(null);
        setSuccess(false);
        setTxHash(null);
        setIsPending(false);
    };

    return {
        depositToKatana,
        isLoading,
        isPending,
        error,
        success,
        txHash,
        reset
    };
}; 