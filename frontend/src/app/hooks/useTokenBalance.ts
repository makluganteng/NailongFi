'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPublicClient, formatUnits, http, erc20Abi } from 'viem';
import { sepolia } from 'viem/chains';
import { config } from '@/lib/config';

export interface TokenBalanceResult {
    value: bigint | null;
    decimals: number | null;
    formatted: string | null;
    numeric: number | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

function getDefaultRpcUrl() {
    return sepolia.rpcUrls.default.http[0];
}

export async function readErc20Balance({
    tokenAddress,
    walletAddress,
    rpcUrl,
}: {
    tokenAddress: `0x${string}`;
    walletAddress: `0x${string}`;
    rpcUrl?: string;
}) {
    const client = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl ?? getDefaultRpcUrl()),
    });

    const [decimals, value] = await Promise.all([
        client.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'decimals',
            args: [],
        }) as Promise<number>,
        client.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [walletAddress],
        }) as Promise<bigint>,
    ]);

    return { decimals, value };
}

export function useTokenBalance(
    tokenAddress: `0x${string}` | undefined,
    walletAddress: `0x${string}` | undefined,
    options?: { rpcUrl?: string }
): TokenBalanceResult {
    const [state, setState] = useState<Pick<TokenBalanceResult, 'value' | 'decimals' | 'isLoading' | 'error'>>({
        value: null,
        decimals: null,
        isLoading: false,
        error: null,
    });

    const fetchBalance = async () => {
        if (!tokenAddress || !walletAddress) return;
        setState((s) => ({ ...s, isLoading: true, error: null }));
        try {
            const { decimals, value } = await readErc20Balance({
                tokenAddress,
                walletAddress,
                rpcUrl: options?.rpcUrl,
            });
            setState({ value, decimals, isLoading: false, error: null });
        } catch (err) {
            setState({ value: null, decimals: null, isLoading: false, error: err as Error });
        }
    };

    useEffect(() => {
        fetchBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenAddress, walletAddress, options?.rpcUrl]);

    const formatted = useMemo(() => {
        if (state.value == null || state.decimals == null) return null;
        try {
            return formatUnits(state.value, state.decimals);
        } catch {
            return null;
        }
    }, [state.value, state.decimals]);

    const numeric = useMemo(() => {
        if (!formatted) return null;
        const n = Number.parseFloat(formatted);
        return Number.isFinite(n) ? n : null;
    }, [formatted]);

    return {
        value: state.value,
        decimals: state.decimals,
        formatted,
        numeric,
        isLoading: state.isLoading,
        error: state.error,
        refetch: fetchBalance,
    };
}

export const USDC_SEPOLIA_ADDRESS = config.USDC_SEPOLIA_ADDRESS as `0x${string}`;
export const WETH_SEPOLIA_ADDRESS = config.WETH_SEPOLIA_ADDRESS as `0x${string}`;

export function useUsdcBalance(walletAddress: `0x${string}` | undefined, options?: { rpcUrl?: string }) {
    return useTokenBalance(USDC_SEPOLIA_ADDRESS, walletAddress, options);
}

export function useWethBalance(walletAddress: `0x${string}` | undefined, options?: { rpcUrl?: string }) {
    return useTokenBalance(WETH_SEPOLIA_ADDRESS, walletAddress, options);
}

export function useEthBalance(walletAddress: `0x${string}` | undefined, options?: { rpcUrl?: string }) {
    const [state, setState] = useState<Pick<TokenBalanceResult, 'value' | 'decimals' | 'isLoading' | 'error'>>({
        value: null,
        decimals: null,
        isLoading: false,
        error: null,
    });

    const fetchBalance = async () => {
        if (!walletAddress) return;
        setState((s) => ({ ...s, isLoading: true, error: null }));
        try {
            const client = createPublicClient({
                chain: sepolia,
                transport: http(options?.rpcUrl ?? getDefaultRpcUrl()),
            });

            const value = await client.getBalance({ address: walletAddress });
            setState({ value, decimals: 18, isLoading: false, error: null });
        } catch (err) {
            setState({ value: null, decimals: null, isLoading: false, error: err as Error });
        }
    };

    useEffect(() => {
        fetchBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress, options?.rpcUrl]);

    const formatted = useMemo(() => {
        if (state.value == null || state.decimals == null) return null;
        try {
            return formatUnits(state.value, state.decimals);
        } catch {
            return null;
        }
    }, [state.value, state.decimals]);

    const numeric = useMemo(() => {
        if (!formatted) return null;
        const n = Number.parseFloat(formatted);
        return Number.isFinite(n) ? n : null;
    }, [formatted]);

    return {
        value: state.value,
        decimals: state.decimals,
        formatted,
        numeric,
        isLoading: state.isLoading,
        error: state.error,
        refetch: fetchBalance,
    };
} 