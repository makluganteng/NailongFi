import { SupabaseExample } from '@/components/supabase-example'

export default function SupabaseTestPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Supabase Integration Test
                </h1>
                <SupabaseExample />
            </div>
        </div>
    )
} 