export interface EthereumTransaction {
  from: string
  to: string | null
  value: string
  gas: string
  gasPrice: string
  hash: string
  nonce: string
  input: string
  blockNumber: string
  transactionIndex: string
  v?: string
  r?: string
  s?: string
  type?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  accessList?: any[]
  chainId?: string
}

export interface EthereumBlock {
  number: string
  hash: string
  parentHash: string
  sha3Uncles: string
  logsBloom: string
  transactionsRoot: string
  stateRoot: string
  receiptsRoot: string
  miner: string
  difficulty: string
  totalDifficulty: string
  extraData: string
  size: string
  gasLimit: string
  gasUsed: string
  timestamp: string
  uncles: string[]
  transactions: EthereumTransaction[]
  baseFeePerGas?: string
  mixHash: string
  nonce: string
  withdrawals?: any[]
}

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  method: string
  params: any[]
  id: number | string
}

export interface JsonRpcResponse<T> {
  jsonrpc: '2.0'
  id: number | string
  result?: T
  error?: {
    code: number
    message: string
    data?: any
  }
}

export interface FetchBlockResult {
  block: EthereumBlock
  blockNumber: bigint
  gasUsed: bigint
  gasLimit: bigint
  baseFeeWei?: bigint
  transactions: Array<{
    id: string
    blockNumber: bigint
    txHash: string
    from: string
    to?: string
    valueWei: bigint
    gasUsed: bigint
    gasPriceWei?: bigint
    nonce: bigint
  }>
}