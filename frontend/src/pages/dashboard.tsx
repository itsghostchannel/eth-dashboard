import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface BlockData {
  blockNumber: string
  hash: string
  parentHash: string
  timestamp: string
  gasUsed: string
  gasLimit: string
  baseFeeWei: string
  txCount: number
}

interface VolumeStats {
  blockNumber: string
  txCount: number
  totalValueWei: string
  totalGasUsed: string
  avgGasPriceWei: string
}

interface TopSender {
  address: string
  txCount: number
  totalValue: string
}

interface GasSpender {
  address: string
  totalGasFeesWei: string
}

export function Dashboard() {
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [volumeStats, setVolumeStats] = useState<VolumeStats[]>([])
  const [topSenders, setTopSenders] = useState<TopSender[]>([])
  const [topGasSpenders, setTopGasSpenders] = useState<GasSpender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [blocksRes, volumeRes, sendersRes, gasRes] = await Promise.all([
          fetch('http://localhost:3001/api/blocks'),
          fetch('http://localhost:3001/api/charts/volume-per-block'),
          fetch('http://localhost:3001/api/stats/top-senders'),
          fetch('http://localhost:3001/api/stats/top-gas-spenders')
        ])

        if (!blocksRes.ok || !volumeRes.ok || !sendersRes.ok || !gasRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const [blocksData, volumeData, sendersData, gasData] = await Promise.all([
          blocksRes.json(),
          volumeRes.json(),
          sendersRes.json(),
          gasRes.json()
        ])

        setBlocks(blocksData.blocks || [])
        setVolumeStats(volumeData.volumeStats || [])
        setTopSenders(sendersData.topSenders || [])
        setTopGasSpenders(gasData.topGasSpenders || [])

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatWei = (wei: string) => {
    const weiBN = BigInt(wei)
    const eth = Number(weiBN) / 1e18
    return `${eth.toFixed(6)} ETH`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )

  if (error) {
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ethereum Dashboard</h1>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Latest Blocks */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Latest Blocks</CardTitle>
            <CardDescription>Most recent blocks and transaction counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-3">
                {blocks.slice(0, 5).map((block) => (
                  <div key={block.blockNumber} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-mono text-sm">#{block.blockNumber}</p>
                      <p className="text-xs text-muted-foreground">{block.txCount} txns</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(block.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volume Stats */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Block Volume</CardTitle>
            <CardDescription>Transaction volume and gas usage per block</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                {volumeStats.map((stat) => (
                  <div key={stat.blockNumber} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 border rounded">
                    <div>
                      <p className="font-mono text-sm">Block #{stat.blockNumber}</p>
                      <p className="text-xs text-muted-foreground">{stat.txCount} transactions</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Value</p>
                      <p className="text-xs">{formatWei(stat.totalValueWei)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gas Used</p>
                      <p className="text-xs">{stat.totalGasUsed}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg Gas Price</p>
                      <p className="text-xs">{stat.avgGasPriceWei} wei</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Senders */}
        <Card>
          <CardHeader>
            <CardTitle>Top Senders</CardTitle>
            <CardDescription>Addresses with most transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-3">
                {topSenders.slice(0, 5).map((sender, index) => (
                  <div key={sender.address} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="text-xs text-muted-foreground">#{index + 1}</p>
                      <p className="font-mono text-sm">{formatAddress(sender.address)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{sender.txCount} txns</p>
                      <p className="text-xs">{formatWei(sender.totalValue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Gas Spenders */}
        <Card>
          <CardHeader>
            <CardTitle>Top Gas Spenders</CardTitle>
            <CardDescription>Addresses spending most on gas fees</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-3">
                {topGasSpenders.slice(0, 5).map((spender, index) => (
                  <div key={spender.address} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="text-xs text-muted-foreground">#{index + 1}</p>
                      <p className="font-mono text-sm">{formatAddress(spender.address)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatWei(spender.totalGasFeesWei)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overall network statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{blocks.length}</p>
                  <p className="text-sm text-muted-foreground">Blocks Tracked</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">
                    {blocks.reduce((sum, block) => sum + block.txCount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{topSenders.length}</p>
                  <p className="text-sm text-muted-foreground">Active Senders</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}