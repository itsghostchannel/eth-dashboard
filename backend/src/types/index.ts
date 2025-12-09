export interface BlockData {
  number: number;
  hash: string;
  parentHash: string;
  miner?: string;
  difficulty?: string;
  totalDifficulty?: string;
  size?: number;
  gasLimit: string;
  gasUsed: string;
  timestamp: number;
  transactionCount: number;
  nonce?: string;
  extraData?: string;
  logsBloom?: string;
  mixHash?: string;
  receiptsRoot?: string;
  sha3Uncles?: string;
  stateRoot?: string;
  transactionsRoot?: string;
  uncles?: string[];
  baseFeePerGas?: string;
}

export interface TransactionData {
  hash: string;
  blockNumber: number;
  transactionIndex: number;
  blockHash: string;
  from: string;
  to?: string;
  value: string;
  gas: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  input: string;
  nonce: number;
  v?: number;
  r?: string;
  s?: string;
  type?: number;
  accessList?: any[];
  chainId?: number;
  status?: number;
  gasUsed?: string;
  contractAddress?: string;
  cumulativeGasUsed?: string;
  effectiveGasPrice?: string;
  logs?: any[];
  logsBloom?: string;
}

export interface WebSocketMessage {
  type: 'block' | 'transaction' | 'error';
  data: BlockData | TransactionData | string;
  timestamp: Date;
}