import { supabase } from '@/lib/supabase'

export interface WithdrawHistoryItem {
    id: number
    user_address: string
    amount: string
    token_address: string
    transaction_hash: string
    destination_network: number
    created_at: string
}

export interface WithdrawHistoryResponse {
    data: WithdrawHistoryItem[] | null
    error: { message: string } | null
}

export const getUserWithdrawHistory = async (userAddress: string): Promise<WithdrawHistoryResponse> => {
    try {
        const { data, error } = await supabase
            .from('withdraw_history')
            .select('*')
            .eq('user_address', userAddress)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching withdraw history:', error)
            return { data: null, error: { message: error.message } }
        }

        return { data: data || [], error: null }
    } catch (err) {
        console.error('Unexpected error fetching withdraw history:', err)
        return {
            data: null,
            error: { message: err instanceof Error ? err.message : 'Unknown error occurred' }
        }
    }
}

export const getAllWithdrawals = async (): Promise<WithdrawHistoryResponse> => {
    try {
        const { data, error } = await supabase
            .from('withdraw_history')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching all withdrawals:', error)
            return { data: null, error: { message: error.message } }
        }

        return { data: data || [], error: null }
    } catch (err) {
        console.error('Unexpected error fetching all withdrawals:', err)
        return {
            data: null,
            error: { message: err instanceof Error ? err.message : 'Unknown error occurred' }
        }
    }
} 