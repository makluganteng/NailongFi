# Supabase Setup Guide

This guide will help you set up Supabase in your Next.js frontend application.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env.local` file in your frontend directory:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js
```

## 📁 File Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   └── database.ts          # Database utility functions
├── hooks/
│   └── useSupabase.ts       # Authentication and session hook
└── components/
    └── supabase-example.tsx # Example component
```

## 🔧 Configuration

### Supabase Client (`src/lib/supabase.ts`)

This file contains:
- Supabase client initialization
- TypeScript types for your database
- Both typed and untyped clients

### Database Utilities (`src/lib/database.ts`)

Common database operations:
- `createRecord()` - Insert new records
- `getRecord()` - Fetch single record
- `updateRecord()` - Update existing records
- `deleteRecord()` - Delete records
- `listRecords()` - Fetch multiple records with filters
- `subscribeToTable()` - Real-time subscriptions
- File storage utilities

### Authentication Hook (`src/hooks/useSupabase.ts`)

Provides:
- User authentication state
- Sign in/up/out functions
- Password reset
- Session management

## 🎯 Usage Examples

### Transaction History Integration

The system automatically records bridge transactions when they succeed:

```tsx
// This happens automatically in the bridge function
import { insertBridgeTransaction } from '@/lib/transactionHistory'

// When a bridge transaction succeeds:
await insertBridgeTransaction({
  userAddress: walletAddress,
  amount: params.amount,
  tokenAddress: params.tokenAddress,
  sourceNetwork: params.sourceNetwork,
  destinationNetwork: params.destinationNetwork,
  transactionHash: result.hash
})
```

### View Transaction History

```tsx
import { useTransactionHistory } from '@/hooks/useTransactionHistory'

function MyComponent() {
  const { 
    transactions, 
    stats, 
    loading, 
    refresh 
  } = useTransactionHistory(userAddress)
  
  return (
    <div>
      <h2>Your Bridge Transactions</h2>
      {transactions.map(tx => (
        <div key={tx.id}>
          {tx.amount} {tx.token_address} 
          from {tx.source_network} to {tx.destination_network}
        </div>
      ))}
    </div>
  )
}
```

### Basic Authentication

```tsx
import { useSupabase } from '@/hooks/useSupabase'

function MyComponent() {
  const { user, signIn, signOut } = useSupabase()
  
  if (user) {
    return <button onClick={signOut}>Sign Out</button>
  }
  
  return <button onClick={() => signIn('email', 'password')}>Sign In</button>
}
```

### Database Operations

```tsx
import { createRecord, listRecords } from '@/lib/database'

// Create a new user
const { data, error } = await createRecord('users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// List users with filters
const { data: users, error } = await listRecords('users', {
  filters: { active: true },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10
})
```

### Real-time Subscriptions

```tsx
import { subscribeToTable } from '@/lib/database'
import { useEffect } from 'react'

useEffect(() => {
  const subscription = subscribeToTable('messages', (payload) => {
    console.log('New message:', payload.new)
  })
  
  return () => subscription.unsubscribe()
}, [])
```

## 🗄️ Database Setup

### 1. Create Tables

In your Supabase dashboard, go to **SQL Editor** and create your tables:

#### Transaction History Table

First, run the SQL script from `database-setup.sql` to create the transaction history table:

```sql
-- Copy and paste the contents of database-setup.sql
-- This will create the transaction_history table with proper indexes and RLS policies
```

```sql
-- Example users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Set Up Row Level Security (RLS)

RLS is enabled by default in Supabase. Create policies to control access:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can only access own data" ON your_table
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Generate TypeScript Types

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the generated types
3. Update the `Database` interface in `src/lib/supabase.ts`

## 🔐 Authentication

### Email/Password

```tsx
const { signUp, signIn } = useSupabase()

// Sign up
await signUp('user@example.com', 'password123')

// Sign in
await signIn('user@example.com', 'password123')
```

### Social Authentication

Supabase supports OAuth providers. Configure them in your dashboard:

```tsx
// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

## 📱 File Storage

```tsx
import { uploadFile, getFileUrl } from '@/lib/database'

// Upload file
const { data, error } = await uploadFile(
  'avatars',
  'user-123/avatar.jpg',
  file
)

// Get public URL
const url = await getFileUrl('avatars', 'user-123/avatar.jpg')
```

## 🚨 Security Best Practices

1. **Never expose service role key** in client-side code
2. **Use RLS policies** to control data access
3. **Validate input** on both client and server
4. **Use environment variables** for sensitive data
5. **Enable email confirmation** for new accounts

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid API key"** - Check your environment variables
2. **"Table doesn't exist"** - Verify table names and RLS policies
3. **"Permission denied"** - Check RLS policies and user authentication
4. **Real-time not working** - Ensure you're subscribed to the correct channel

### Debug Mode

Enable debug mode in development:

```tsx
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
})
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 Next Steps

1. Set up your database schema
2. Configure authentication providers
3. Set up RLS policies
4. Test your integration
5. Deploy with proper environment variables

Need help? Check the [Supabase Discord](https://discord.supabase.com) or [GitHub Discussions](https://github.com/supabase/supabase/discussions). 