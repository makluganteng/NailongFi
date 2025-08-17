'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface IdleAssetsCardProps {
    usdcBalance: string;
    usdcNumeric: number;
    isLoading: boolean;
    otherAssets?: Array<{
        symbol: string;
        balance: string;
        numeric: number;
        icon?: string;
    }>;
    ethPrice?: number | null;
}

export function IdleAssetsCard({
    usdcBalance,
    usdcNumeric,
    isLoading,
    otherAssets = [],
    ethPrice
}: IdleAssetsCardProps) {
    const totalValue = usdcNumeric + otherAssets.reduce((sum, asset) => sum + asset.numeric, 0);

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold">Your Assets</CardTitle>
                    <CardDescription className="text-base">Loading your portfolio...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-24 bg-muted/50 rounded-lg"></div>
                        <div className="space-y-3">
                            <div className="h-16 bg-muted/50 rounded-lg"></div>
                            <div className="h-16 bg-muted/50 rounded-lg"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-bold text-center">Your Idle Assets</CardTitle>
                <CardDescription className="text-base text-center">Assets available for investment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Total Value Display */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="text-sm text-muted-foreground mb-2 font-medium">Total Available</div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                {/* USDC Balance */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            $
                        </div>
                        <div>
                            <div className="font-semibold text-lg">USDC</div>
                            <div className="text-sm text-muted-foreground">
                                {usdcBalance} USDC
                                <span className="ml-2 text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">
                                    $1.00/USDC
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">${usdcNumeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </div>

                {/* Other Assets */}
                {otherAssets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {asset.symbol === 'ETH' ? 'Ξ' : (asset.icon || asset.symbol[0])}
                            </div>
                            <div>
                                <div className="font-semibold text-lg">{asset.symbol}</div>
                                <div className="text-sm text-muted-foreground">
                                    {asset.balance} {asset.symbol}
                                    {ethPrice && asset.symbol === 'ETH' && (
                                        <span className="ml-2 text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded-full">
                                            ${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ETH
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-lg">${asset.numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                ))}

                {otherAssets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm font-medium">No other assets found</div>
                        <div className="text-xs">Connect more wallets to see additional assets</div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 