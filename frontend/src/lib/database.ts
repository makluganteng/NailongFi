import { supabase } from './supabase'

// Generic CRUD operations
export async function createRecord<T>(
    table: string,
    data: T
) {
    const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

    return { data: result, error }
}

export async function getRecord<T>(
    table: string,
    id: string
) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

    return { data: data as T, error }
}

export async function updateRecord<T>(
    table: string,
    id: string,
    data: Partial<T>
) {
    const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()

    return { data: result, error }
}

export async function deleteRecord(
    table: string,
    id: string
) {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

    return { error }
}

export async function listRecords<T>(
    table: string,
    options?: {
        select?: string
        filters?: Record<string, any>
        orderBy?: { column: string; ascending?: boolean }
        limit?: number
        offset?: number
    }
) {
    let query = supabase.from(table).select(options?.select || '*')

    if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
            query = query.eq(key, value)
        })
    }

    if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true
        })
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    return { data: data as T[], error }
}

// Real-time subscriptions
export function subscribeToTable<T>(
    table: string,
    callback: (payload: any) => void,
    filters?: Record<string, any>
) {
    const query = supabase
        .channel(`${table}_changes`)
        .on(
            'postgres_changes' as any,
            {
                event: '*',
                schema: 'public',
                table: table,
                ...(filters && { filter: filters })
            },
            callback
        )
        .subscribe()

    return query
}

// File storage utilities
export async function uploadFile(
    bucket: string,
    path: string,
    file: File
) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file)

    return { data, error }
}

export async function getFileUrl(
    bucket: string,
    path: string
) {
    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

    return data.publicUrl
}

export async function deleteFile(
    bucket: string,
    path: string
) {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

    return { error }
} 