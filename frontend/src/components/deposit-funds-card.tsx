'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface DepositFundsCardProps {
    value: string;
    onChange: (value: string) => void;
    quickAmounts?: string[];
    currencySymbol?: string;
    maxNumeric?: number; // maximum allowed numeric amount, undefined means no max
    helperText?: string; // optional line shown below input
}

function toNumber(value: string): number | null {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

function formatAmountLabel(amount: string | number): string {
    const numeric = typeof amount === 'number' ? amount : Number(amount);
    if (Number.isNaN(numeric)) return String(amount);
    return numeric.toLocaleString();
}

export function DepositFundsCard({
    value,
    onChange,
    quickAmounts = ["100", "500", "1000"],
    currencySymbol = "$",
    maxNumeric,
    helperText,
}: DepositFundsCardProps) {
    const handleChange = (next: string) => {
        if (maxNumeric == null) return onChange(next);
        const n = toNumber(next);
        if (n == null) return onChange(next);
        const clamped = Math.min(n, maxNumeric);
        onChange(String(clamped));
    };

    const isOverMax = (() => {
        if (maxNumeric == null) return false;
        const n = toNumber(value);
        return n != null && n > maxNumeric;
    })();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Deposit Funds</CardTitle>
                <CardDescription>How much would you like to invest?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-medium text-muted-foreground">
                        {currencySymbol}
                    </span>
                    <Input
                        type="number"
                        placeholder="1,000"
                        className="h-20 w-full rounded-md border-0 bg-muted/50 text-center text-5xl font-bold"
                        value={value}
                        onChange={(E: React.ChangeEvent<HTMLInputElement>) => handleChange(E.target.value)}
                    />
                </div>
                {helperText && (
                    <div className="text-xs text-muted-foreground text-left px-1">
                        {helperText}
                    </div>
                )}
                {isOverMax && (
                    <div className="text-xs text-left px-1 text-red-500">Amount exceeds available balance</div>
                )}
                <div className="grid grid-cols-3 gap-2 pt-1">
                    {quickAmounts.map((amount) => {
                        const amountNum = toNumber(amount) ?? Infinity;
                        const disabled = maxNumeric != null && amountNum > maxNumeric;
                        return (
                            <Button
                                key={amount}
                                variant="outline"
                                onClick={() => handleChange(amount)}
                                className={value === amount ? 'bg-primary text-primary-foreground' : ''}
                                disabled={disabled}
                                title={disabled ? 'Exceeds available balance' : undefined}
                            >
                                {currencySymbol}
                                {formatAmountLabel(amount)}
                            </Button>
                        );
                    })}
                    {typeof maxNumeric === 'number' && (
                        <Button
                            key="max"
                            variant="outline"
                            onClick={() => handleChange(String(maxNumeric))}
                            className={toNumber(value) === maxNumeric ? 'bg-primary text-primary-foreground' : ''}
                            disabled={maxNumeric <= 0}
                            title={maxNumeric <= 0 ? 'No available balance' : undefined}
                        >
                            Max
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 