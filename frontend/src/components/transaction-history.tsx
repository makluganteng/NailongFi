'use client'

import { useState } from 'react'
import { useTransactionHistory } from '@/hooks/useTransactionHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatEther, formatUnits } from 'viem'
import { config } from '@/lib/config'

interface TransactionHistoryProps {
    userAddress?: string
    showAll?: boolean
    limit?: number
}

export function TransactionHistory({ userAddress, showAll = false, limit = 10 }: TransactionHistoryProps) {
    const {
        transactions,
        stats,
        loading,
        error,
        refresh,
        pendingTransactions,
        completedTransactions,
        failedTransactions
    } = useTransactionHistory(showAll ? undefined : userAddress)

    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true
        return t.status === filter
    }).slice(0, limit)

    const getNetworkName = (networkId: number) => {
        switch (networkId) {
            case 0: return 'Sepolia'
            case 29: return 'Katana'
            default: return `Network ${networkId}`
        }
    }

    const getTokenName = (tokenAddress: string) => {
        if (tokenAddress === config.ETH_SEPOLIA_ADDRESS) return 'ETH'
        if (tokenAddress === config.WETH_SEPOLIA_ADDRESS) return 'WETH'
        return 'Token'
    }

    const formatAmount = (amount: string, tokenAddress: string) => {
        try {
            const decimals = tokenAddress === config.ETH_SEPOLIA_ADDRESS || tokenAddress === config.WETH_SEPOLIA_ADDRESS ? 18 : 6
            return formatUnits(BigInt(amount), decimals)
        } catch {
            return amount
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            case 'completed': return 'text-green-600 bg-green-100'
            case 'failed': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return '⏳'
            case 'completed': return '✅'
            case 'failed': return '❌'
            default: return '❓'
        }
    }

    if (loading && transactions.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading transactions...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <p className="text-red-600 mb-4">Error loading transactions: {error}</p>
                        <Button onClick={refresh} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-gray-600">Total Transactions</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                <p className="text-sm text-gray-600">Failed</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                >
                    All ({transactions.length})
                </Button>
                <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('pending')}
                >
                    Pending ({pendingTransactions.length})
                </Button>
                <Button
                    variant={filter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('completed')}
                >
                    Completed ({completedTransactions.length})
                </Button>
                <Button
                    variant={filter === 'failed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('failed')}
                >
                    Failed ({failedTransactions.length})
                </Button>
            </div>

            {/* Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                        {showAll ? 'All bridge transactions' : 'Your bridge transactions'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No transactions found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className={getStatusColor(transaction.status)}>
                                                {getStatusIcon(transaction.status)} {transaction.status}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(transaction.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {formatAmount(transaction.amount, transaction.token_address)} {getTokenName(transaction.token_address)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {getNetworkName(transaction.source_network)} → {getNetworkName(transaction.destination_network)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">User Address</p>
                                            <p className="font-mono text-xs truncate">{transaction.user_address}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Transaction Hash</p>
                                            <p className="font-mono text-xs truncate">{transaction.transaction_hash}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredTransactions.length > 0 && (
                        <div className="mt-4 text-center">
                            <Button onClick={refresh} variant="outline" size="sm">
                                Refresh
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 