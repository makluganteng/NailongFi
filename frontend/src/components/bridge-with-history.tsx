'use client'

import { useState } from 'react'
import { useTransactionHistory } from '@/hooks/useTransactionHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BridgeWithHistoryProps {
    userAddress: string
    onBridgeSuccess?: () => void
}

export function BridgeWithHistory({ userAddress, onBridgeSuccess }: BridgeWithHistoryProps) {
    const {
        transactions,
        stats,
        loading,
        refresh,
        recentTransactions
    } = useTransactionHistory(userAddress)

    const [showHistory, setShowHistory] = useState(false)

    return (
        <div className="space-y-6">
            {/* Bridge Success Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Bridge Activity Summary</CardTitle>
                    <CardDescription>
                        Overview of your bridge transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {stats && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-sm text-gray-600">Successful</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                <p className="text-sm text-gray-600">Failed</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowHistory(!showHistory)}
                            variant="outline"
                        >
                            {showHistory ? 'Hide' : 'Show'} Recent Transactions
                        </Button>
                        <Button onClick={refresh} variant="outline" size="sm">
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            {showHistory && recentTransactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bridge Transactions</CardTitle>
                        <CardDescription>
                            Your latest bridge activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {transaction.status}
                                        </span>
                                        <div>
                                            <p className="font-medium">
                                                {transaction.amount} {transaction.token_address === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'Token'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Network {transaction.source_network} → {transaction.destination_network}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        {new Date(transaction.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-center">
                            <Button
                                onClick={() => window.location.href = '/transaction-history'}
                                variant="outline"
                            >
                                View Full History
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Callback when bridge succeeds */}
            {onBridgeSuccess && (
                <div className="text-center">
                    <Button onClick={onBridgeSuccess} variant="outline">
                        Bridge Another Asset
                    </Button>
                </div>
            )}
        </div>
    )
} 