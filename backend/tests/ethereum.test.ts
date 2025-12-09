import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchBlock, EthereumRPCError } from '../src/lib/ethereum'

// Mock the fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ethereum RPC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ETH_RPC_URL = 'https://mainnet.infura.io/v3/test-project-id'
  })

  it('should successfully fetch latest block with transactions', async () => {
    const mockBlockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        number: '0x10f5c8',
        hash: '0xabc123...',
        parentHash: '0xdef456...',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        logsBloom: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        transactionsRoot: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        stateRoot: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        receiptsRoot: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        miner: '0x1234567890123456789012345678901234567890',
        difficulty: '0x0',
        totalDifficulty: '0x13456789',
        extraData: '0x',
        size: '0x5208',
        gasLimit: '0x7a1200',
        gasUsed: '0x5208',
        timestamp: '0x63f7a123',
        uncles: [],
        transactions: [
          {
            from: '0x1234567890123456789012345678901234567890',
            to: '0x9876543210987654321098765432109876543210',
            value: '0xde0b6b3a7640000',
            gas: '0x5208',
            gasPrice: '0x4a817c800',
            hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
            nonce: '0x7b',
            input: '0x',
            blockNumber: '0x10f5c8',
            transactionIndex: '0x0',
            v: '0x25',
            r: '0x1111111111111111111111111111111111111111111111111111111111111111',
            s: '0x2222222222222222222222222222222222222222222222222222222222222222'
          },
          {
            from: '0x2345678901234567890123456789012345678901',
            to: null,
            value: '0x0',
            gas: '0x61a80',
            gasPrice: '0x4a817c800',
            hash: '0x3333333333333333333333333333333333333333333333333333333333333333',
            nonce: '0x1c8',
            input: '0x608060405234801561001057600080fd5b50',
            blockNumber: '0x10f5c8',
            transactionIndex: '0x1',
            v: '0x1b',
            r: '0x3333333333333333333333333333333333333333333333333333333333333333',
            s: '0x4444444444444444444444444444444444444444444444444444444444444444'
          }
        ],
        baseFeePerGas: '0x4a817c800',
        mixHash: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        nonce: '0x0000000000000000'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBlockResponse
    })

    const result = await fetchBlock()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://mainnet.infura.io/v3/test-project-id',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('eth_getBlockByNumber')
      }
    )

    expect(result.blockNumber).toBe(1111496n)
    expect(result.block.hash).toBe('0xabc123...')
    expect(result.gasUsed).toBe(21000n)
    expect(result.gasLimit).toBe(8000000n)
    expect(result.baseFeeWei).toBe(20000000000n)

    expect(result.transactions).toHaveLength(2)
    expect(result.transactions[0]).toEqual({
      id: '1111496-0x1111111111111111111111111111111111111111111111111111111111111111',
      blockNumber: 1111496n,
      txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      from: '0x1234567890123456789012345678901234567890',
      to: '0x9876543210987654321098765432109876543210',
      valueWei: 1000000000000000000n,
      gasUsed: 21000n,
      gasPriceWei: 20000000000n,
      nonce: 123n
    })

    expect(result.transactions[1]).toEqual({
      id: '1111496-0x3333333333333333333333333333333333333333333333333333333333333333',
      blockNumber: 1111496n,
      txHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      from: '0x2345678901234567890123456789012345678901',
      to: undefined,
      valueWei: 0n,
      gasUsed: 400000n,
      gasPriceWei: 20000000000n,
      nonce: 456n
    })
  })

  it('should handle JSON-RPC error response', async () => {
    const errorResponse = {
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => errorResponse
    })

    await expect(fetchBlock()).rejects.toThrow(EthereumRPCError)
  })

  it('should handle HTTP error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })

    await expect(fetchBlock()).rejects.toThrow('HTTP 500: Internal Server Error')
  })

  it('should handle missing result in response', async () => {
    const response = {
      jsonrpc: '2.0',
      id: 1
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => response
    })

    await expect(fetchBlock()).rejects.toThrow('No result returned from RPC call')
  })

  it('should handle missing ETH_RPC_URL environment variable', async () => {
    delete process.env.ETH_RPC_URL

    await expect(fetchBlock()).rejects.toThrow('ETH_RPC_URL environment variable is required')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(fetchBlock()).rejects.toThrow('Failed to fetch latest block: Network error')
  })
})