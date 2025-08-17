import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these from your Supabase dashboard)
export interface Database {
    public: {
        Tables: {
            transaction_history: {
                Row: {
                    id: string
                    user_address: string
                    amount: string
                    token_address: string
                    source_network: number
                    destination_network: number
                    transaction_hash: string
                    status: 'pending' | 'completed' | 'failed'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_address: string
                    amount: string
                    token_address: string
                    source_network: number
                    destination_network: number
                    transaction_hash: string
                    status?: 'pending' | 'completed' | 'failed'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_address?: string
                    amount?: string
                    token_address?: string
                    source_network?: number
                    destination_network?: number
                    transaction_hash?: string
                    status?: 'pending' | 'completed' | 'failed'
                    created_at?: string
                    updated_at?: string
                }
            }
            // Add your other table definitions here
            // Example:
            // users: {
            //   Row: {
            //     id: string
            //     email: string
            //     created_at: string
            //   }
            //   Insert: {
            //     id?: string
            //     email: string
            //     created_at?: string
            //   }
            //   Update: {
            //     id?: string
            //     email?: string
            //     created_at?: string
            //   }
            // }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Typed Supabase client
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey) 