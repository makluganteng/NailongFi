'use client';

import { useEffect, useState } from 'react';

export interface TokenPriceResult {
    price: number | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useEthPrice(): TokenPriceResult {
    const [state, setState] = useState<Pick<TokenPriceResult, 'price' | 'isLoading' | 'error'>>({
        price: null,
        isLoading: false,
        error: null,
    });

    const fetchPrice = async () => {
        setState((s) => ({ ...s, isLoading: true, error: null }));
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
            );

            if (!response.ok) {
                throw new Error('Failed to fetch ETH price');
            }

            const data = await response.json();
            const price = data.ethereum?.usd;

            if (typeof price !== 'number') {
                throw new Error('Invalid price data');
            }

            setState({ price, isLoading: false, error: null });
        } catch (err) {
            setState({ price: null, isLoading: false, error: err as Error });
        }
    };

    useEffect(() => {
        fetchPrice();

        // Refresh price every 5 minutes
        const interval = setInterval(fetchPrice, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        price: state.price,
        isLoading: state.isLoading,
        error: state.error,
        refetch: fetchPrice,
    };
} 