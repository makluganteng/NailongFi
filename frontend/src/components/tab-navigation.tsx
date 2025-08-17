'use client'

import { Button } from '@/components/ui/button'

interface TabNavigationProps {
    activeTab: 'assets' | 'history'
    onTabChange: (tab: 'assets' | 'history') => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    return (
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-full max-w-md mx-auto">
            <Button
                variant={activeTab === 'assets' ? 'default' : 'ghost'}
                onClick={() => onTabChange('assets')}
                className="flex-1 transition-all duration-200"
            >
                <span className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    Assets
                </span>
            </Button>
            <Button
                variant={activeTab === 'history' ? 'default' : 'ghost'}
                onClick={() => onTabChange('history')}
                className="flex-1 transition-all duration-200"
            >
                <span className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    History
                </span>
            </Button>
        </div>
    )
} 