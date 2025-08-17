import { useState, useEffect, useCallback } from 'react'
import {
    getUserTransactionHistory,
    getAllTransactions,
    getTransactionStats,
    type BridgeTransaction
} from '@/lib/transactionHistory'
import type { Database } from '@/lib/supabase'

type TransactionHistory = Database['public']['Tables']['transaction_history']['Row']

export function useTransactionHistory(userAddress?: string) {
    const [transactions, setTransactions] = useState<TransactionHistory[]>([])
    const [stats, setStats] = useState<{
        total: number
        pending: number
        completed: number
        failed: number
        totalVolume: string
    } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch user's transaction history
    const fetchUserTransactions = useCallback(async (
        options?: {
            limit?: number
            offset?: number
            status?: 'pending' | 'completed' | 'failed'
        }
    ) => {
        if (!userAddress) return

        setLoading(true)
        setError(null)

        try {
            const { data, error } = await getUserTransactionHistory(userAddress, options)

            if (error) {
                throw new Error(error.message || 'Failed to fetch transactions')
            }

            setTransactions(data || [])
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Error fetching user transactions:', err)
        } finally {
            setLoading(false)
        }
    }, [userAddress])

    // Fetch all transactions (for admin purposes)
    const fetchAllTransactions = useCallback(async (
        options?: {
            limit?: number
            offset?: number
            status?: 'pending' | 'completed' | 'failed'
            sourceNetwork?: number
            destinationNetwork?: number
        }
    ) => {
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await getAllTransactions(options)

            if (error) {
                throw new Error(error.message || 'Failed to fetch transactions')
            }

            setTransactions(data || [])
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Error fetching all transactions:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch transaction statistics
    const fetchStats = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await getTransactionStats()

            if (error) {
                throw new Error(error.message || 'Failed to fetch stats')
            }

            setStats(data)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Error fetching transaction stats:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    // Refresh data
    const refresh = useCallback(() => {
        if (userAddress) {
            fetchUserTransactions()
        }
        fetchStats()
    }, [userAddress, fetchUserTransactions, fetchStats])

    // Initial load
    useEffect(() => {
        refresh()
    }, [refresh])

    // Get transactions by status
    const getTransactionsByStatus = useCallback((status: 'pending' | 'completed' | 'failed') => {
        return transactions.filter(t => t.status === status)
    }, [transactions])

    // Get recent transactions
    const getRecentTransactions = useCallback((limit: number = 5) => {
        return transactions.slice(0, limit)
    }, [transactions])

    // Get transactions by network
    const getTransactionsByNetwork = useCallback((network: number, isSource: boolean = true) => {
        return transactions.filter(t =>
            isSource ? t.source_network === network : t.destination_network === network
        )
    }, [transactions])

    return {
        // State
        transactions,
        stats,
        loading,
        error,

        // Actions
        fetchUserTransactions,
        fetchAllTransactions,
        fetchStats,
        refresh,

        // Utilities
        getTransactionsByStatus,
        getRecentTransactions,
        getTransactionsByNetwork,

        // Computed values
        pendingTransactions: getTransactionsByStatus('pending'),
        completedTransactions: getTransactionsByStatus('completed'),
        failedTransactions: getTransactionsByStatus('failed'),
        recentTransactions: getRecentTransactions(5)
    }
} 