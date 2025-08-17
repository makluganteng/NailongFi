import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// update the user's transaction history state
export const updateTransactionHistoryStatus = async (depositCount: string) => {
    const { data, error } = await supabase
        .from('transaction_history')
        .update({ status: 'completed' })
        .eq('deposit_count', depositCount)
        .eq('status', 'pending')

    // if there is then we update that to success
    if (error) {
        console.log(error)
        return { data: null, error: error }
    }

    const { data: userData, error: userError } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('deposit_count', depositCount)

    console.log(`User Data: ${userData}`)

    if (userData) {
        return { data: userData, error: userError }
    }

    return { data: null, error: null }
}

// Store withdraw history for user tracking
export const storeWithdrawHistory = async (withdrawData: {
    user_address: string
    amount: string
    token_address: string
    transaction_hash: string
    destination_network: number
}) => {
    const { data, error } = await supabase
        .from('withdraw_history')
        .insert([withdrawData])
        .select()

    if (error) {
        console.log('Error storing withdraw history:', error)
        return { data: null, error: error }
    }

    console.log('Withdraw history stored successfully:', data)
    return { data: data, error: null }
}

// Get user's withdraw history
export const getUserWithdrawHistory = async (userAddress: string) => {
    const { data, error } = await supabase
        .from('withdraw_history')
        .select('*')
        .eq('user_address', userAddress)
        .order('created_at', { ascending: false })

    if (error) {
        console.log('Error fetching withdraw history:', error)
        return { data: null, error: error }
    }

    return { data: data, error: null }
}


// Export the client for use in other files
export default supabase
