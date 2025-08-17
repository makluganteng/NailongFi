'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Zap, TrendingUp, Shield, Globe, ArrowUpRight } from "lucide-react"
import { IdleAssetsCard } from "@/components/idle-assets-card"
import { useUsdcBalance, useEthBalance, useWethBalance } from '../hooks/useTokenBalance';
import { useEthPrice } from '../hooks/useTokenPrice';

interface OnboardingSlide {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    features?: string[];
    highlight?: string;
}

interface OnboardingFlowProps {
    onComplete?: () => void;
    onClose?: () => void;
}

export default function OnboardingFlow({ onComplete, onClose }: OnboardingFlowProps) {
    const { user, logout } = usePrivy();
    const [currentSlide, setCurrentSlide] = useState(0);

    const walletAddress = ((user as any)?.wallet?.address ?? (user as any)?.walletAddress ?? undefined) as `0x${string}` | undefined;
    const { formatted: usdcFormatted, numeric: usdcNumeric, isLoading: isUsdcLoading } = useUsdcBalance(walletAddress);
    const { formatted: ethFormatted, numeric: ethNumeric, isLoading: isEthLoading } = useEthBalance(walletAddress);
    const { formatted: wethFormatted, numeric: wethNumeric, isLoading: isWethLoading } = useWethBalance(walletAddress);
    const { price: ethPrice, isLoading: isEthPriceLoading } = useEthPrice();

    const handleBack = () => {
        logout();
    };

    const handleNext = () => {
        setCurrentSlide(prev => Math.min(prev + 1, onboardingSlides.length - 1));
    };

    const handlePrevious = () => {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
    };

    const handleSkip = () => {
        setCurrentSlide(onboardingSlides.length - 1);
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

    const onboardingSlides: OnboardingSlide[] = [
        {
            title: "Welcome to NailongFi",
            subtitle: "Your Gateway to DeFi Yield",
            description: "NailongFi is a revolutionary DeFi platform that bridges traditional assets to high-yield opportunities on Katana Network.",
            icon: <Globe className="w-16 h-16 text-blue-600" />,
            features: [
                "Cross-chain asset bridging",
                "Automated yield strategies",
                "Professional risk management"
            ]
        },
        {
            title: "How It Works",
            subtitle: "Simple 3-Step Process",
            description: "Get started in minutes with our streamlined process that maximizes your returns while minimizing complexity.",
            icon: <ArrowUpRight className="w-16 h-16 text-purple-600" />,
            features: [
                "1. Deposit your assets (USDC, ETH, WETH)",
                "2. Assets are automatically bridged to Katana",
                "3. Start earning up to 30% APY immediately"
            ]
        },
        {
            title: "Smart Yield Strategies",
            subtitle: "Professional-Grade Investment",
            description: "Our AI-powered strategies automatically optimize your portfolio across multiple yield sources for maximum returns.",
            icon: <TrendingUp className="w-16 h-16 text-green-600" />,
            features: [
                "AI-optimized yield farming",
                "Multi-strategy diversification",
                "Real-time performance monitoring"
            ],
            highlight: "30% APY Target"
        },
        {
            title: "Security First",
            subtitle: "Your Assets Are Protected",
            description: "Built with enterprise-grade security measures and audited smart contracts to ensure your investments are safe.",
            icon: <Shield className="w-16 h-16 text-orange-600" />,
            features: [
                "Audited smart contracts",
                "Multi-sig security",
                "Insurance coverage",
                "24/7 monitoring"
            ]
        },
        {
            title: "Ready to Start?",
            subtitle: "Your Portfolio Awaits",
            description: "You're all set! Let's get your assets working for you and start earning passive income.",
            icon: <Zap className="w-16 h-16 text-blue-600" />,
            features: [
                "Quick Zap buttons for instant deposits",
                "Real-time portfolio tracking",
                "Professional analytics dashboard"
            ]
        }
    ];

    const currentSlideData = onboardingSlides[currentSlide];
    const isFirstSlide = currentSlide === 0;
    const isLastSlide = currentSlide === onboardingSlides.length - 1;

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header with Back Button and Progress */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
                        {onboardingSlides.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? 'bg-blue-600 w-6'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Skip
                        </Button>
                        {onClose && (
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ✕
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Onboarding Content */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                {currentSlideData.icon}
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {currentSlideData.title}
                                    </h1>
                                    <p className="text-xl text-muted-foreground font-medium">
                                        {currentSlideData.subtitle}
                                    </p>
                                </div>
                            </div>

                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {currentSlideData.description}
                            </p>

                            {currentSlideData.highlight && (
                                <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                                    {currentSlideData.highlight}
                                </div>
                            )}
                        </div>

                        {currentSlideData.features && (
                            <div className="space-y-3">
                                {currentSlideData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-muted-foreground">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-4 pt-4">
                            {!isFirstSlide && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                            )}

                            {!isLastSlide ? (
                                <Button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    onClick={onComplete}
                                    className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    Get Started
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Asset Preview */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-4 text-center">Your Assets Preview</h3>
                        <IdleAssetsCard
                            usdcBalance={usdcFormatted ?? '0'}
                            usdcNumeric={usdcNumeric ?? 0}
                            isLoading={isLoading}
                            otherAssets={otherAssets}
                            ethPrice={ethPrice}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 