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


// Export the client for use in other files
export default supabase
