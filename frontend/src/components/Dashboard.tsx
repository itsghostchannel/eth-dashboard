import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { RefreshCw, Power, LayoutDashboard } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatTimeAgo, weiToEth, weiToGwei, truncateAddress, formatTransactionCount, calculateGasPercentage, formatGasPrice } from '@/lib/format'

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

interface VolumeStats {
  blockNumber: string
  txCount: number
  totalValueWei: string
  totalGasUsed: string
  avgGasPriceWei: string
}

interface DashboardData {
  latestBlock: LatestBlock | null
  topSenders: TopSender[]
  topReceivers: TopReceiver[]
  topGasSpenders: GasSpender[]
  volumeStats: VolumeStats[]
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    latestBlock: null,
    topSenders: [],
    topReceivers: [],
    topGasSpenders: [],
    volumeStats: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoPoll, setAutoPoll] = useState<boolean>(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null)

      // Trigger backend sync (for Vercel/Serverless support)
      // We ignore errors here so the UI still loads even if sync fails
      try {
        await fetch('/api/blocks/sync', { method: 'POST' })
      } catch (e) {
        console.warn('Background sync failed', e)
      }

      // Fetch all data in parallel
      const [latestRes, sendersRes, receiversRes, gasRes, volumeRes] = await Promise.all([
        fetch('/api/blocks/latest'),
        fetch('/api/stats/top-senders'),
        fetch('/api/stats/top-receivers'),
        fetch('/api/stats/top-gas-spenders'),
        fetch('/api/charts/volume-per-block')
      ])

      // Check if all requests were successful
      if (!latestRes.ok || !sendersRes.ok || !receiversRes.ok || !gasRes.ok || !volumeRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [latestBlock, sendersData, receiversData, gasData, volumeData] = await Promise.all([
        latestRes.json(),
        sendersRes.json(),
        receiversRes.json(),
        gasRes.json(),
        volumeRes.json()
      ])

      setData({
        latestBlock,
        topSenders: sendersData.topSenders || [],
        topReceivers: receiversData.topReceivers || [],
        topGasSpenders: gasData.topGasSpenders || [],
        volumeStats: volumeData.volumeStats || []
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

  // Set up polling every 30 seconds (only if auto-poll is enabled)
  useEffect(() => {
    if (!autoPoll) return

    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchDashboardData, autoPoll])

  const toggleAutoPoll = () => {
    setAutoPoll(!autoPoll)
  }

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
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8" />
            Ethereum Dashboard
          </h1>
          <div className="text-sm text-muted-foreground">
            Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchDashboardData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={toggleAutoPoll}
            variant={autoPoll ? "default" : "outline"}
            size="sm"
            data-testid="auto-poll-button"
          >
            <Power className="h-4 w-4 mr-2" />
            Auto-poll: {autoPoll ? "ON" : "OFF"}
          </Button>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Count Line Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Transaction Count Trend</CardTitle>
              <CardDescription>Transactions per block over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingSkeleton />
                </div>
              ) : data.volumeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[...data.volumeStats].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="blockNumber"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [formatTransactionCount(Number(value)), 'Transactions']}
                      labelFormatter={(label) => `Block #${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="txCount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Value Bar Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Total Value per Block</CardTitle>
              <CardDescription>ETH value transferred per block</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingSkeleton />
                </div>
              ) : data.volumeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[...data.volumeStats].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="blockNumber"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value} ETH`}
                    />
                    <Tooltip
                      formatter={(value) => [`${parseFloat(weiToEth(String(value))).toFixed(6)} ETH`, 'Total Value']}
                      labelFormatter={(label) => `Block #${label}`}
                    />
                    <Bar
                      dataKey="totalValueWei"
                      fill="#10b981"
                      name="Total Value (wei)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gas Usage Area Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Gas Usage Trend</CardTitle>
              <CardDescription>Total gas used per block</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingSkeleton />
                </div>
              ) : data.volumeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[...data.volumeStats].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="blockNumber"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${formatTransactionCount(Number(value))}`,
                        'Gas Used'
                      ]}
                      labelFormatter={(label) => `Block #${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalGasUsed"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}