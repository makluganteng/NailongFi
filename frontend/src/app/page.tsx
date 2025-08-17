'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import OnboardingFlow from "@/app/components/OnboardingFlow"

export default function WelcomePage() {
  const { login, authenticated, user } = usePrivy();

  // If user is already authenticated, show the onboarding flow
  if (authenticated) {
    return <OnboardingFlow />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">NailongFi</h1>
          <p className="text-muted-foreground">The easiest way to auto compound idle assets.</p>
        </div>
        <Card className="text-left">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Connect your wallet to continue.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={login}
              variant="outline"
              className="w-full justify-center bg-transparent"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect with Privy
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
