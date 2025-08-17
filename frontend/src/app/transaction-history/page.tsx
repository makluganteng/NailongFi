import { TransactionHistory } from '@/components/transaction-history'

export default function TransactionHistoryPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Bridge Transaction History
                </h1>

                <div className="space-y-8">
                    {/* User's Transaction History */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Your Transactions</h2>
                        <TransactionHistory
                            userAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                            limit={5}
                        />
                    </div>

                    {/* All Transactions (Admin View) */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">All Transactions (Admin View)</h2>
                        <TransactionHistory
                            showAll={true}
                            limit={10}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
} 