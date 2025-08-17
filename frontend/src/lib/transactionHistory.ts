import { supabaseTyped } from './supabase'
import type { Database } from './supabase'

type TransactionHistory = Database['public']['Tables']['transaction_history']['Row']
type TransactionHistoryInsert = Database['public']['Tables']['transaction_history']['Insert']
type TransactionHistoryUpdate = Database['public']['Tables']['transaction_history']['Update']

export interface BridgeTransaction {
    userAddress: string
    amount: string
    tokenAddress: string
    sourceNetwork: number
    destinationNetwork: number
    transactionHash: string
    depositCount?: number
}

/**
 * Insert a new bridge transaction record
 */
export async function insertBridgeTransaction(
    transaction: BridgeTransaction
): Promise<{ data: TransactionHistory | null; error: any }> {
    const { data, error } = await supabaseTyped
        .from('transaction_history')
        .insert({
            user_address: transaction.userAddress,
            amount: transaction.amount,
            token_address: transaction.tokenAddress,
            source_network: transaction.sourceNetwork,
            destination_network: transaction.destinationNetwork,
            transaction_hash: transaction.transactionHash,
            deposit_count: transaction.depositCount,
            status: 'pending'
        })
        .select()
        .single()

    return { data, error }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
    transactionHash: string,
    status: 'pending' | 'completed' | 'failed'
): Promise<{ data: TransactionHistory | null; error: any }> {
    const { data, error } = await supabaseTyped
        .from('transaction_history')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('transaction_hash', transactionHash)
        .select()
        .single()

    return { data, error }
}

/**
 * Get transaction by hash
 */
export async function getTransactionByHash(
    transactionHash: string
): Promise<{ data: TransactionHistory | null; error: any }> {
    const { data, error } = await supabaseTyped
        .from('transaction_history')
        .select('*')
        .eq('transaction_hash', transactionHash)
        .single()

    return { data, error }
}

/**
 * Get user's transaction history
 */
export async function getUserTransactionHistory(
    userAddress: string,
    options?: {
        limit?: number
        offset?: number
        status?: 'pending' | 'completed' | 'failed'
    }
): Promise<{ data: TransactionHistory[] | null; error: any }> {
    let query = supabaseTyped
        .from('transaction_history')
        .select('*')
        .eq('user_address', userAddress)
        .order('created_at', { ascending: false })

    if (options?.status) {
        query = query.eq('status', options.status)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    return { data, error }
}

/**
 * Get all transactions with filters
 */
export async function getAllTransactions(
    options?: {
        limit?: number
        offset?: number
        status?: 'pending' | 'completed' | 'failed'
        sourceNetwork?: number
        destinationNetwork?: number
    }
): Promise<{ data: TransactionHistory[] | null; error: any }> {
    let query = supabaseTyped
        .from('transaction_history')
        .select('*')
        .order('created_at', { ascending: false })

    if (options?.status) {
        query = query.eq('status', options.status)
    }

    if (options?.sourceNetwork !== undefined) {
        query = query.eq('source_network', options.sourceNetwork)
    }

    if (options?.destinationNetwork !== undefined) {
        query = query.eq('destination_network', options.destinationNetwork)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    return { data, error }
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(): Promise<{
    data: {
        total: number
        pending: number
        completed: number
        failed: number
        totalVolume: string
    } | null
    error: any
}> {
    const { data, error } = await supabaseTyped
        .from('transaction_history')
        .select('status, amount')

    if (error) return { data: null, error }

    const stats = {
        total: data.length,
        pending: data.filter(t => t.status === 'pending').length,
        completed: data.filter(t => t.status === 'completed').length,
        failed: data.filter(t => t.status === 'failed').length,
        totalVolume: '0'
    }

    // Calculate total volume (sum of completed transactions)
    const completedAmounts = data
        .filter(t => t.status === 'completed')
        .map(t => BigInt(t.amount))

    if (completedAmounts.length > 0) {
        const totalVolume = completedAmounts.reduce((sum, amount) => sum + amount, BigInt(0))
        stats.totalVolume = totalVolume.toString()
    }

    return { data: stats, error: null }
} 