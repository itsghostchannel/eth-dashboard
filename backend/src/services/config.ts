export function getPollInterval(): number {
  return parseInt(process.env.POLL_INTERVAL || '30000', 10)
}

export function getMaxBlocks(): number {
  return parseInt(process.env.MAX_BLOCKS || '5', 10)
}

export function getEthRpcUrl(): string {
  return process.env.ETH_RPC_URL || ''
}

export function validateConfig(): void {
  const ethRpcUrl = getEthRpcUrl()
  const pollInterval = getPollInterval()
  const maxBlocks = getMaxBlocks()

  if (!ethRpcUrl) {
    throw new Error('ETH_RPC_URL environment variable is required')
  }

  if (pollInterval < 1000) {
    throw new Error('POLL_INTERVAL must be at least 1000ms')
  }

  if (maxBlocks < 1) {
    throw new Error('MAX_BLOCKS must be at least 1')
  }
}