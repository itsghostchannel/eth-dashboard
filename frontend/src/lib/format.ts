/**
 * Format wei value to ETH
 */
export function weiToEth(wei: string | number | bigint): string {
  const weiBN = BigInt(wei)
  const eth = Number(weiBN) / 1e18
  return eth.toFixed(6)
}

/**
 * Format wei value to ETH with custom precision
 */
export function weiToEthPrecision(wei: string | number | bigint, precision: number = 6): string {
  const weiBN = BigInt(wei)
  const eth = Number(weiBN) / 1e18
  return eth.toFixed(precision)
}

/**
 * Format wei value to Gwei
 */
export function weiToGwei(wei: string | number | bigint): string {
  const weiBN = BigInt(wei)
  const gwei = Number(weiBN) / 1e9
  return gwei.toFixed(2)
}

/**
 * Format large number with K/M/B suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toString()
}

/**
 * Format gas price with appropriate unit
 */
export function formatGasPrice(gasPriceWei: string | number | bigint): string {
  const gwei = weiToGwei(gasPriceWei)
  return `${gwei} Gwei`
}

/**
 * Truncate Ethereum address for display
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return ''
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format transaction count
 */
export function formatTransactionCount(count: number): string {
  return count.toLocaleString()
}

/**
 * Calculate gas usage percentage
 */
export function calculateGasPercentage(gasUsed: string | bigint, gasLimit: string | bigint): number {
  const used = BigInt(gasUsed)
  const limit = BigInt(gasLimit)
  return Number((used * 100n) / limit)
}

/**
 * Format time ago using date-fns
 */
export function formatTimeAgo(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleString()
}