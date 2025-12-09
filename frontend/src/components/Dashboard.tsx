import React, { useEffect, useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { formatTimeAgo, weiToEth, weiToGwei, truncateAddress, formatTransactionCount, calculateGasPercentage } from '@/lib/format'

interface LatestBlock {
  blockNumber: string
  hash: string
  parentHash: string
  timestamp: string
  gasUsed: string
  gasLimit: string
  baseFeeWei: string
  txCount: number
  totalValueWei: string
  avgGasPrice: string | null
}

interface TopSender {
  address: string
  txCount: number
  totalValue: string
}

interface TopReceiver {
  address: string
  txCount: number
  totalValue: string
}

interface GasSpender {
  address: string
  totalGasFeesWei: string
}

interface DashboardData {
  latestBlock: LatestBlock | null
  topSenders: TopSender[]
  topReceivers: TopReceiver[]
  topGasSpenders: GasSpender[]
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    latestBlock: null,
    topSenders: [],
    topReceivers: [],
    topGasSpenders: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null)

      // Fetch all data in parallel
      const [latestRes, sendersRes, receiversRes, gasRes] = await Promise.all([
        fetch('http://localhost:3001/api/blocks/latest'),
        fetch('http://localhost:3001/api/stats/top-senders'),
        fetch('http://localhost:3001/api/stats/top-receivers'),
        fetch('http://localhost:3001/api/stats/top-gas-spenders')
      ])

      // Check if all requests were successful
      if (!latestRes.ok || !sendersRes.ok || !receiversRes.ok || !gasRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [latestBlock, sendersData, receiversData, gasData] = await Promise.all([
        latestRes.json(),
        sendersRes.json(),
        receiversRes.json(),
        gasRes.json()
      ])

      setData({
        latestBlock,
        topSenders: sendersData.topSenders || [],
        topReceivers: receiversData.topReceivers || [],
        topGasSpenders: gasData.topGasSpenders || []
      })

      setLastUpdated(new Date())

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Set up polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchDashboardData])

  // Calculate derived metrics
  const totalTransactions = data.latestBlock?.txCount || 0
  const avgValueEth = totalTransactions > 0
    ? weiToEth(data.latestBlock?.totalValueWei || '0')
    : '0.000000'
  const avgGasPrice = data.latestBlock?.avgGasPrice || '0'

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )

  const HeaderCardSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const KPICardSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  )

  if (error && loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-destructive">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with last updated time */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ethereum Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-sm">
              Error: {error} - Showing last successful data
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {/* Header Card - Latest Block Info */}
        <div className="col-span-full">
          {loading ? (
            <HeaderCardSkeleton />
          ) : data.latestBlock ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Latest Block
                  <span className="text-lg font-mono text-muted-foreground">
                    #{data.latestBlock.blockNumber}
                  </span>
                </CardTitle>
                <CardDescription>
                  {formatTimeAgo(data.latestBlock.timestamp)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hash</p>
                    <p className="font-mono text-xs truncate">{data.latestBlock.hash}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Base Fee</p>
                    <p className="font-mono">{weiToGwei(data.latestBlock.baseFeeWei)} Gwei</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                    <p className="font-mono">{formatTransactionCount(data.latestBlock.txCount)}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Gas Used</span>
                    <span>{calculateGasPercentage(data.latestBlock.gasUsed, data.latestBlock.gasLimit)}%</span>
                  </div>
                  <Progress
                    value={calculateGasPercentage(data.latestBlock.gasUsed, data.latestBlock.gasLimit)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTransactionCount(Number(data.latestBlock.gasUsed))}</span>
                    <span>{formatTransactionCount(Number(data.latestBlock.gasLimit))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No block data available
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transaction Count</CardTitle>
                  <CardDescription>In latest block</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTransactionCount(totalTransactions)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Value</CardTitle>
                  <CardDescription>Per transaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {avgValueEth} ETH
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Gas Price</CardTitle>
                  <CardDescription>In latest block</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatGasPrice(avgGasPrice)}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* DataTables for Top Senders, Receivers, Gas Spenders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Senders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Senders</CardTitle>
              <CardDescription>Most transaction senders</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Txns</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topSenders.slice(0, 10).map((sender, index) => (
                        <TableRow key={sender.address}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {truncateAddress(sender.address)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatTransactionCount(sender.txCount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {weiToEth(sender.totalValue)} ETH
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Receivers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Receivers</CardTitle>
              <CardDescription>Most transaction receivers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Txns</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topReceivers.slice(0, 10).map((receiver, index) => (
                        <TableRow key={receiver.address}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {truncateAddress(receiver.address)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatTransactionCount(receiver.txCount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {weiToEth(receiver.totalValue)} ETH
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Gas Spenders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Gas Spenders</CardTitle>
              <CardDescription>Highest gas fees spent</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Gas Fees</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topGasSpenders.slice(0, 10).map((spender, index) => (
                        <TableRow key={spender.address}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {truncateAddress(spender.address)}
                          </TableCell>
                          <TableCell className="text-right">
                            {weiToEth(spender.totalGasFeesWei)} ETH
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}