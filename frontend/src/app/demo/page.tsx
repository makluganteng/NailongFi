import { TabbedInterface } from '@/components/tabbed-interface'

export default function DemoPage() {
    // Demo wallet address for testing
    const demoWalletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' as `0x${string}`

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">Tabbed Interface Demo</h1>
                    <p className="text-lg text-muted-foreground">
                        This demonstrates the Assets and History tabs functionality
                    </p>
                </div>

                <TabbedInterface walletAddress={demoWalletAddress} />
            </div>
        </div>
    )
} 