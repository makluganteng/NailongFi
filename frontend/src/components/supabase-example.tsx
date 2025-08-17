'use client'

import { useState } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SupabaseExample() {
    const { user, session, loading, signIn, signUp, signOut } = useSupabase()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState('')

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        const { error } = isSignUp
            ? await signUp(email, password)
            : await signIn(email, password)

        if (error) {
            setMessage(error.message)
        } else {
            setMessage(isSignUp ? 'Check your email for confirmation!' : 'Signed in successfully!')
            setEmail('')
            setPassword('')
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p>Loading...</p>
                </CardContent>
            </Card>
        )
    }

    if (user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {user.email}!</CardTitle>
                    <CardDescription>You are signed in to Supabase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                        <p><strong>User ID:</strong> {user.id}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
                    </div>
                    <Button onClick={signOut} variant="outline">
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
                <CardDescription>
                    {isSignUp ? 'Create a new account' : 'Sign in to your account'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {message && (
                        <p className={`text-sm ${message.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
                            {message}
                        </p>
                    )}

                    <div className="space-y-2">
                        <Button type="submit" className="w-full">
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="w-full"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
} 