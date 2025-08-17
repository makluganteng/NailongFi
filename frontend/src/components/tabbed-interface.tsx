'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TransactionHistory } from './transaction-history'
import { TabNavigation } from './tab-navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useUsdcBalance, useEthBalance, useWethBalance } from '../app/hooks/useTokenBalance'
import { useEthPrice } from '../app/hooks/useTokenPrice'
import { useKatanaDeposit } from '../app/hooks/useKatanaDeposit'
import { useKatanaBalance } from '../app/hooks/useKatanaBalance'
import { Modal } from './ui/modal'
import { PortfolioChart } from './portfolio-chart'
import { config } from '@/lib/config'
import { ArrowDownToLine } from 'lucide-react'

interface TabbedInterfaceProps {
    walletAddress?: `0x${string}`
}

export function TabbedInterface({ walletAddress }: TabbedInterfaceProps) {
    const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets')
    const [selectedAsset, setSelectedAsset] = useState<'USDC' | 'ETH' | 'WETH' | null>(null)
    const [depositAmount, setDepositAmount] = useState('')
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

    const { depositToKatana, isLoading: isDepositing, error: depositError, success: depositSuccess, reset: resetDeposit } = useKatanaDeposit()

    // Token balance hooks
    const { formatted: usdcFormatted, numeric: usdcNumeric, isLoading: isUsdcLoading, refetch: refetchUsdc } = useUsdcBalance(walletAddress)
    const { formatted: ethFormatted, numeric: ethNumeric, isLoading: isEthLoading, refetch: refetchEth } = useEthBalance(walletAddress)
    const { formatted: wethFormatted, numeric: wethNumeric, isLoading: isWethLoading, refetch: refetchWeth } = useWethBalance(walletAddress)
    const { price: ethPrice, isLoading: isEthPriceLoading } = useEthPrice()

    // Katana balance hook
    const { formatted: katanaFormatted, numeric: katanaNumeric, isLoading: isKatanaLoading, refetch: refetchKatana } = useKatanaBalance(walletAddress)

    const isLoading = isUsdcLoading || isEthLoading || isWethLoading || isEthPriceLoading || isKatanaLoading
    const ethUsdValue = ethNumeric && ethPrice ? ethNumeric * ethPrice : 0
    const wethUsdValue = wethNumeric && ethPrice ? wethNumeric * ethPrice : 0
    const katanaUsdValue = katanaNumeric && ethPrice ? katanaNumeric * ethPrice : 0
    const totalValue = (usdcNumeric ?? 0) + ethUsdValue + wethUsdValue + katanaUsdValue

    const handleAssetSelect = (asset: 'USDC' | 'ETH' | 'WETH') => {
        setSelectedAsset(asset)
        resetDeposit()
        if (asset === 'USDC') {
            setDepositAmount(usdcFormatted ?? '0')
        } else if (asset === 'ETH') {
            setDepositAmount(ethFormatted ?? '0')
        } else if (asset === 'WETH') {
            setDepositAmount(wethFormatted ?? '0')
        }
        setIsDepositModalOpen(true)
    }

    const handleDeposit = async () => {
        if (!selectedAsset || !depositAmount || !walletAddress) return

        try {
            // Determine token address based on selected asset
            let tokenAddress: string
            if (selectedAsset === 'USDC') {
                tokenAddress = config.USDC_SEPOLIA_ADDRESS
            } else if (selectedAsset === 'WETH') {
                tokenAddress = config.WETH_SEPOLIA_ADDRESS
            } else {
                tokenAddress = config.ETH_SEPOLIA_ADDRESS
            }

            // Katana contract address - use vault address for deposits
            const katanaContractAddress = config.NAILONG_VAULT_ADDRESS

            await depositToKatana({
                tokenAddress,
                amount: depositAmount,
                sourceNetwork: 0, // Sepolia
                destinationNetwork: 29, // Katana
                callAddress: katanaContractAddress,
                fallbackAddress: walletAddress
            })

            // Reset form on success
            setSelectedAsset(null)
            setDepositAmount('')
            setIsDepositModalOpen(false)

            // Refresh balances
            refetchUsdc()
            refetchEth()
            refetchWeth()
            refetchKatana()

        } catch (err) {
            console.error('Deposit failed:', err)
        }
    }

    const handleMaxAmount = () => {
        if (selectedAsset === 'USDC') {
            setDepositAmount(usdcFormatted ?? '0')
        } else if (selectedAsset === 'ETH') {
            setDepositAmount(ethFormatted ?? '0')
        } else if (selectedAsset === 'WETH') {
            setDepositAmount(wethFormatted ?? '0')
        }
    }

    const handleCancel = () => {
        setSelectedAsset(null)
        setDepositAmount('')
        resetDeposit()
        setIsDepositModalOpen(false)
    }

    const handleWithdrawMax = () => {
        setWithdrawAmount(katanaFormatted ?? '0')
    }

    const handleWithdraw = async () => {
        if (!withdrawAmount || !walletAddress) return

        try {
            // Simulate withdrawal process
            console.log('Withdrawing', withdrawAmount, 'WETH from Katana vault')

            // In a real app, you would call the withdrawal function here
            // await withdrawFromKatana({ amount: withdrawAmount, ... })

            // Reset form and close modal
            setWithdrawAmount('')
            setIsWithdrawModalOpen(false)

            // Refresh balances
            refetchKatana()

        } catch (err) {
            console.error('Withdrawal failed:', err)
        }
    }

    const handleWithdrawCancel = () => {
        setWithdrawAmount('')
        setIsWithdrawModalOpen(false)
    }

    const closeModal = () => {
        setIsDepositModalOpen(false)
        setSelectedAsset(null)
        setDepositAmount('')
        resetDeposit()
    }

    return (
        <div className="w-full max-w-6xl space-y-6">
            {/* Tab Navigation */}
            <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            {activeTab === 'assets' && (
                <div className="space-y-6">
                    {/* Total Portfolio Value */}
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800/50">
                        <CardHeader>
                            <CardTitle className="text-center text-2xl">Total Portfolio Value</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">Available for investment</div>
                        </CardContent>
                    </Card>

                    {/* Portfolio Chart */}
                    <PortfolioChart totalValue={totalValue} walletAddress={walletAddress} />

                    {/* Assets Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Assets</CardTitle>
                            <CardDescription>Select an asset to deposit into investment strategies</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* USDC Asset */}
                            <div
                                className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-600"
                                onClick={() => handleAssetSelect('USDC')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        $
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg">USDC</div>
                                        <div className="text-sm text-muted-foreground">
                                            {usdcFormatted ?? '0'} USDC
                                            <span className="ml-2 text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">
                                                $1.00/USDC
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">${usdcNumeric?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0'}</div>
                                </div>
                            </div>

                            {/* ETH Asset */}
                            <div
                                className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-600"
                                onClick={() => handleAssetSelect('ETH')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        Ξ
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg">ETH</div>
                                        <div className="text-sm text-muted-foreground">
                                            {ethFormatted ?? '0'} ETH
                                            {ethPrice && (
                                                <span className="ml-2 text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded-full">
                                                    ${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ETH
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">${ethUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>

                            {/* WETH Asset */}
                            <div
                                className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-orange-300 dark:hover:border-orange-600"
                                onClick={() => handleAssetSelect('WETH')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        W
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg">WETH</div>
                                        <div className="text-sm text-muted-foreground">
                                            {wethFormatted ?? '0'} WETH
                                            {ethPrice && (
                                                <span className="ml-2 text-xs bg-orange-200 dark:bg-orange-800 px-2 py-1 rounded-full">
                                                    ${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/WETH
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">${wethUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Working Assets Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assets at Work</CardTitle>
                            <CardDescription>
                                Your assets currently deployed in investment strategies on Katana
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isKatanaLoading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <div className="text-sm font-medium">Loading Katana balance...</div>
                                    <div className="text-xs">Checking your working assets</div>
                                </div>
                            ) : katanaNumeric && katanaNumeric > 0 ? (
                                <div
                                    className="flex items-center justify-between p-4 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 cursor-pointer hover:border-green-300 dark:hover:border-green-600 transition-all"
                                    onClick={() => setIsWithdrawModalOpen(true)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            K
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Katana Vault</div>
                                            <div className="text-sm text-muted-foreground">
                                                {katanaFormatted ?? '0'} WETH
                                                <span className="ml-2 text-xs bg-green-200 dark:bg-green-800 px-2 py-1 rounded-full">
                                                    Working
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full text-blue-700 dark:text-blue-300 font-medium">
                                                    30% APY
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">${(katanaNumeric * (ethPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            Earning daily
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <div className="text-sm font-medium">No assets currently working</div>
                                    <div className="text-xs">Deposit assets above to start earning 30% APY</div>
                                    <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                        Earn up to 30% APY on your deposits
                                    </div>
                                    {katanaFormatted !== null && (
                                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                            Connected to Katana • Balance: {katanaFormatted} WETH
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => { refetchUsdc(); refetchEth(); refetchWeth(); refetchKatana(); }}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Refreshing…' : 'Refresh Balances'}
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Bridge Transaction History</h2>
                        <p className="text-sm text-muted-foreground">
                            Track all your bridge transactions
                        </p>
                    </div>

                    <TransactionHistory
                        userAddress={walletAddress}
                        showAll={false}
                        limit={20}
                    />
                </div>
            )}

            {/* Deposit Modal */}
            <Modal
                isOpen={isDepositModalOpen}
                onClose={closeModal}
                title={`Deposit ${selectedAsset}`}
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">Enter the amount you want to deposit into investment strategies</p>

                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button
                            variant="outline"
                            onClick={handleMaxAmount}
                            className="px-4 h-12"
                        >
                            Max
                        </Button>
                    </div>

                    {/* Error Message */}
                    {depositError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="text-sm text-red-600 dark:text-red-400">
                                Error: {depositError}
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {depositSuccess && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="text-sm text-green-600 dark:text-green-400">
                                Successfully initiated deposit to Katana!
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeposit}
                            disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isDepositing}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {isDepositing ? 'Depositing…' : `Deposit ${selectedAsset}`}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                isOpen={isWithdrawModalOpen}
                onClose={handleWithdrawCancel}
                title="Withdraw from Katana Vault"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">Enter the amount of WETH you want to withdraw from the vault</p>

                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button
                            variant="outline"
                            onClick={handleWithdrawMax}
                            className="px-4 h-12"
                        >
                            Max
                        </Button>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                            Available to withdraw: {katanaFormatted ?? '0'} WETH
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleWithdrawCancel}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (katanaNumeric || 0)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <ArrowDownToLine className="h-4 w-4 mr-2" />
                            Withdraw WETH
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
} 