'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, formatUnits, http } from 'viem';
import { config } from '@/lib/config';

// NailongMain contract ABI for the checkBalance function
const NAILONG_MAIN_ABI = [
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'checkBalance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
] as const;

export interface KatanaBalanceResult {
    value: bigint | null;
    formatted: string | null;
    numeric: number | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useKatanaBalance(
    walletAddress: `0x${string}` | undefined,
    contractAddress?: `0x${string}`
): KatanaBalanceResult {
    const [state, setState] = useState<Pick<KatanaBalanceResult, 'value' | 'isLoading' | 'error'>>({
        value: null,
        isLoading: false,
        error: null,
    });

    const vault_bridge_abi = [
        {
            inputs: [{ name: 'owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function'
        }
    ]

    // Use the contract address from config if not provided
    const targetContractAddress = config.NAILONG_VAULT_ADDRESS as `0x${string}`;

    const fetchBalance = async () => {
        if (!walletAddress || !targetContractAddress) return;

        setState((s) => ({ ...s, isLoading: true, error: null }));

        try {
            console.log('Fetching Katana balance for:', walletAddress, 'on contract:', targetContractAddress);

            const client = createPublicClient({
                transport: http("https://rpc.tatara.katanarpc.com/")
            });

            const value = await client.readContract({
                address: targetContractAddress,
                abi: NAILONG_MAIN_ABI,
                functionName: 'checkBalance',
                args: [walletAddress],
            }) as bigint;

            console.log('Katana balance result:', value.toString());
            setState({ value, isLoading: false, error: null });
        } catch (err) {
            console.error('Error fetching Katana balance:', err);
            setState({ value: null, isLoading: false, error: err as Error });
        }
    };

    useEffect(() => {
        fetchBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress, targetContractAddress]);

    const formatted = state.value !== null ? formatUnits(state.value, 18) : null;
    const numeric = formatted ? Number.parseFloat(formatted) : null;

    return {
        value: state.value,
        formatted,
        numeric,
        isLoading: state.isLoading,
        error: state.error,
        refetch: fetchBalance,
    };
} 