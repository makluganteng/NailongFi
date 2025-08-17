'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { sepolia } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
    console.log(process.env.NEXT_PUBLIC_PRIVY_APP_ID);
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets'
                    }
                },
                supportedChains: [
                    sepolia
                ]
            }}
        >
            {children}
        </PrivyProvider>
    );
}