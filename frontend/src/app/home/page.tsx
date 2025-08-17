'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { TabbedInterface } from '@/components/tabbed-interface';
import { LogOut } from 'lucide-react';

export default function HomePage() {
    const { authenticated, user, login, logout } = usePrivy();
    const walletAddress = ((user as any)?.wallet?.address ?? (user as any)?.walletAddress ?? undefined) as `0x${string}` | undefined;

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
    );
} 