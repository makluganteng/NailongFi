import { getUserWithdrawHistory } from '@/lib/withdrawHistory'
import { useState, useEffect, useCallback } from 'react'

interface WithdrawHistoryItem {
    id: number
    user_address: string
    amount: string
    token_address: string
    transaction_hash: string
    destination_network: number
    created_at: string
}

interface WithdrawHistoryStats {
    total: number
    pending: number
    completed: number
    failed: number
}

export function useWithdrawHistory(userAddress?: string) {
    const [withdrawals, setWithdrawals] = useState<WithdrawHistoryItem[]>([])
    const [stats, setStats] = useState<WithdrawHistoryStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch user's withdrawal history
    const fetchUserWithdrawals = useCallback(async () => {
        if (!userAddress) return

        setLoading(true)
        setError(null)

        try {
            const { data, error } = await getUserWithdrawHistory(userAddress)

            if (error) {
                throw new Error(error.message || 'Failed to fetch withdrawals')
            }

            setWithdrawals(data || [])

            // Calculate stats
            const total = data?.length || 0
            setStats({
                total,
                pending: total, // All withdrawals are considered completed since they're stored after execution
                completed: total,
                failed: 0
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Error fetching user withdrawals:', err)
        } finally {
            setLoading(false)
        }
    }, [userAddress])

    // Refresh data
    const refresh = useCallback(() => {
        fetchUserWithdrawals()
    }, [fetchUserWithdrawals])

    // Initial load
    useEffect(() => {
        refresh()
    }, [refresh])

    // Get withdrawals by status (all are considered completed)
    const getWithdrawalsByStatus = useCallback((status: 'pending' | 'completed' | 'failed') => {
        if (status === 'completed') return withdrawals
        return []
    }, [withdrawals])

    // Get recent withdrawals
    const getRecentWithdrawals = useCallback((limit: number = 5) => {
        return withdrawals.slice(0, limit)
    }, [withdrawals])

    return {
        // State
        withdrawals,
        stats,
        loading,
        error,

        // Actions
        fetchUserWithdrawals,
        refresh,

        // Utilities
        getWithdrawalsByStatus,
        getRecentWithdrawals,

        // Computed values
        pendingWithdrawals: getWithdrawalsByStatus('pending'),
        completedWithdrawals: getWithdrawalsByStatus('completed'),
        failedWithdrawals: getWithdrawalsByStatus('failed'),
        recentWithdrawals: getRecentWithdrawals(5)
    }
} 