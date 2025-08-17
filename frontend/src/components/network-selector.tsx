'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Network {
    id: string;
    name: string;
    icon: string;
    description: string;
    apy: string;
}

const networks: Network[] = [
    {
        id: 'ethereum',
        name: 'Ethereum',
        icon: '🔵',
        description: 'Most secure and established',
        apy: '4.2%'
    },
    {
        id: 'polygon',
        name: 'Polygon',
        icon: '🟣',
        description: 'Low fees, high speed',
        apy: '8.5%'
    },
    {
        id: 'arbitrum',
        name: 'Arbitrum',
        icon: '🔵',
        description: 'Layer 2 scaling solution',
        apy: '6.8%'
    },
    {
        id: 'optimism',
        name: 'Optimism',
        icon: '🔴',
        description: 'Fast and cost-effective',
        apy: '7.2%'
    }
];

export function NetworkSelector() {
    const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum');

    return (
        <div className="grid grid-cols-2 gap-3">
            {networks.map((network) => (
                <Card
                    key={network.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedNetwork === network.id
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                    onClick={() => setSelectedNetwork(network.id)}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{network.icon}</span>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-sm">{network.name}</h3>
                                <p className="text-xs text-muted-foreground">{network.description}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-muted-foreground">Estimated APY</p>
                            <p className="text-sm font-semibold text-green-600">{network.apy}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
} 