'use client';

import { usePrivy } from '@privy-io/react-auth';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { IdleAssetsCard } from "@/components/idle-assets-card"
import { useUsdcBalance, useEthBalance, useWethBalance } from '../hooks/useTokenBalance';
import { useEthPrice } from '../hooks/useTokenPrice';

export default function OnboardingFlow() {
    const { user, logout } = usePrivy();

    const walletAddress = ((user as any)?.wallet?.address ?? (user as any)?.walletAddress ?? undefined) as `0x${string}` | undefined;
    const { formatted: usdcFormatted, numeric: usdcNumeric, isLoading: isUsdcLoading } = useUsdcBalance(walletAddress);
    const { formatted: ethFormatted, numeric: ethNumeric, isLoading: isEthLoading } = useEthBalance(walletAddress);
    const { formatted: wethFormatted, numeric: wethNumeric, isLoading: isWethLoading } = useWethBalance(walletAddress);
    const { price: ethPrice, isLoading: isEthPriceLoading } = useEthPrice();

    const handleBack = () => {
        logout();
    };

    const isLoading = isUsdcLoading || isEthLoading || isWethLoading || isEthPriceLoading;

    // Calculate ETH and WETH values in USD
    const ethUsdValue = ethNumeric && ethPrice ? ethNumeric * ethPrice : 0;
    const wethUsdValue = wethNumeric && ethPrice ? wethNumeric * ethPrice : 0;

    const otherAssets = [];

    if (ethNumeric && ethNumeric > 0) {
        otherAssets.push({
            symbol: 'ETH',
            balance: ethFormatted ?? '0',
            numeric: ethUsdValue,
            icon: 'Ξ'
        });
    }

    if (wethNumeric && wethNumeric > 0) {
        otherAssets.push({
            symbol: 'WETH',
            balance: wethFormatted ?? '0',
            numeric: wethUsdValue,
            icon: 'W'
        });
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <div className="w-full max-w-lg space-y-8">
                {/* Back Button */}
                <div className="flex justify-start">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>

                <IdleAssetsCard
                    usdcBalance={usdcFormatted ?? '0'}
                    usdcNumeric={usdcNumeric ?? 0}
                    isLoading={isLoading}
                    otherAssets={otherAssets}
                    ethPrice={ethPrice}
                />

                <Button size="lg" className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200" asChild>
                    <Link href="/home">Continue to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
} 