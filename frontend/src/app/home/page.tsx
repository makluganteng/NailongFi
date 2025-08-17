'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TabbedInterface } from '@/components/tabbed-interface';
import OnboardingFlow from '../components/OnboardingFlow';
import { LogOut } from 'lucide-react';

export default function HomePage() {
    const { authenticated, user, login, logout } = usePrivy();
    const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(false);
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

    const walletAddress = ((user as any)?.wallet?.address ?? (user as any)?.walletAddress ?? undefined) as `0x${string}` | undefined;

    // Check if user is new (first time connecting this wallet)
    useEffect(() => {
        if (walletAddress && authenticated) {
            const onboardingKey = `onboarding_${walletAddress}`;
            const hasSeen = localStorage.getItem(onboardingKey);

            if (hasSeen) {
                setIsNewUser(false);
                setHasSeenOnboarding(true);
            } else {
                setIsNewUser(true);
                setHasSeenOnboarding(false);
                // Automatically show onboarding for new users
                setShowOnboarding(true);
            }
        }
    }, [walletAddress, authenticated]);

    const handleOnboardingComplete = () => {
        if (walletAddress) {
            const onboardingKey = `onboarding_${walletAddress}`;
            localStorage.setItem(onboardingKey, 'completed');
            setHasSeenOnboarding(true);
            setIsNewUser(false);
            setShowOnboarding(false);
        }
    };

    const handleOnboardingClose = () => {
        setShowOnboarding(false);
        // Mark as seen even if they close it
        if (walletAddress) {
            const onboardingKey = `onboarding_${walletAddress}`;
            localStorage.setItem(onboardingKey, 'completed');
            setHasSeenOnboarding(true);
            setIsNewUser(false);
        }
    };

    if (!authenticated) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
                <div className="w-full max-w-sm text-center space-y-4">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground">Sign in to view your portfolio overview.</p>
                    <Button variant="outline" onClick={login}>Connect with Privy</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
                <div className="w-full max-w-6xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">NailongFi</h1>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                Wallet: {walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : '—'}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowOnboarding(true)}
                                className="flex items-center gap-2"
                            >
                                Help
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={logout}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>

                    <TabbedInterface walletAddress={walletAddress} />
                </div>
            </div>

            {/* Onboarding Modal Overlay */}
            {showOnboarding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <OnboardingFlow
                            onComplete={handleOnboardingComplete}
                            onClose={handleOnboardingClose}
                        />
                    </div>
                </div>
            )}
        </>
    );
} 