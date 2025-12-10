import { EthereumBlock, JsonRpcRequest, JsonRpcResponse, FetchBlockResult } from '../types/block'

function getRpcUrl(): string {
  const url = process.env.ETHEREUM_RPC_URL || process.env.ETH_RPC_URL
  if (!url) {
    throw new Error('ETHEREUM_RPC_URL environment variable is required')
  }
  return url
}

class EthereumRPCError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(`Ethereum RPC Error ${code}: ${message}`)
    this.name = 'EthereumRPCError'
  }
}

async function makeRpcRequest<T>(method: string, params: any[]): Promise<T> {
  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now()
  }

  const response = await fetch(getRpcUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json() as JsonRpcResponse<T>

  if (data.error) {
    throw new EthereumRPCError(data.error.code, data.error.message, data.error.data)
  }

  if (!data.result) {
    throw new Error('No result returned from RPC call')
  }

  return data.result
}

function parseBigInt(value: string): bigint {
  if (value.startsWith('0x')) {
    return BigInt(value)
  }
  return BigInt(value)
}

export async function fetchBlock(): Promise<FetchBlockResult> {
  try {
    const block = await makeRpcRequest<EthereumBlock>('eth_getBlockByNumber', ['finalized', true])

    const blockNumber = parseBigInt(block.number)
    const gasUsed = parseBigInt(block.gasUsed)
    const gasLimit = parseBigInt(block.gasLimit)
    const baseFeeWei = block.baseFeePerGas ? parseBigInt(block.baseFeePerGas) : undefined

    const transactions = block.transactions.map(tx => ({
      id: `${blockNumber}-${tx.hash}`,
      blockNumber,
      txHash: tx.hash,
      from: tx.from,
      to: tx.to || undefined,
      valueWei: parseBigInt(tx.value),
      gasUsed: parseBigInt(tx.gas),
      gasPriceWei: tx.gasPrice ? parseBigInt(tx.gasPrice) : undefined,
      nonce: parseBigInt(tx.nonce)
    }))

    return {
      block,
      blockNumber,
      gasUsed,
      gasLimit,
      baseFeeWei,
      transactions
    }
  } catch (error) {
    if (error instanceof EthereumRPCError) {
      throw error
    }

    if (error instanceof Error) {
      throw new Error(`Failed to fetch latest block: ${error.message}`)
    }

    throw new Error('Unknown error occurred while fetching block')
  }
}

export { EthereumRPCError }