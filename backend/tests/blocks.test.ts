import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../src/app'

// Mock the singleton prisma instance
vi.mock('../src/prisma', () => ({
  default: {
    block: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn()
    },
    $disconnect: vi.fn()
  }
}))

describe('Blocks API', () => {
  let mockPrisma: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { default: prisma } = await import('../src/prisma')
    mockPrisma = prisma

    // Set default return values for all methods
    mockPrisma.block.findMany.mockResolvedValue([])
    mockPrisma.block.findFirst.mockResolvedValue(null)
    mockPrisma.block.findUnique.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/blocks', () => {
    it('should return last 5 blocks with transaction count', async () => {
      const mockBlocks = [
        {
          blockNumber: 100n,
          hash: '0xabc123',
          parentHash: '0xdef456',
          timestamp: new Date('2023-01-01T00:00:00Z'),
          gasUsed: 1000n,
          gasLimit: 2000n,
          baseFeeWei: 50n,
          transactions: [
            { id: '1', txHash: '0x111' },
            { id: '2', txHash: '0x222' }
          ]
        },
        {
          blockNumber: 99n,
          hash: '0xdef789',
          parentHash: '0xabc456',
          timestamp: new Date('2023-01-01T00:00:00Z'),
          gasUsed: 800n,
          gasLimit: 2000n,
          baseFeeWei: 45n,
          transactions: []
        }
      ]

      mockPrisma.block.findMany.mockResolvedValue(mockBlocks)

      const response = await request(app)
        .get('/api/blocks')
        .expect(200)

      expect(response.body).toEqual({
        blocks: [
          {
            blockNumber: '100',
            hash: '0xabc123',
            parentHash: '0xdef456',
            timestamp: mockBlocks[0].timestamp.toISOString(),
            gasUsed: '1000',
            gasLimit: '2000',
            baseFeeWei: '50',
            txCount: 2
          },
          {
            blockNumber: '99',
            hash: '0xdef789',
            parentHash: '0xabc456',
            timestamp: mockBlocks[1].timestamp.toISOString(),
            gasUsed: '800',
            gasLimit: '2000',
            baseFeeWei: '45',
            txCount: 0
          }
        ],
        total: 2
      })

      expect(mockPrisma.block.findMany).toHaveBeenCalledWith({
        orderBy: { blockNumber: 'desc' },
        take: 5,
        include: { transactions: true }
      })
    })

    it('should handle database errors', async () => {
      mockPrisma.block.findMany.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/blocks')
        .expect(500)

      expect(response.body).toEqual({ error: 'Failed to fetch blocks' })
    })

    it('should return empty array when no blocks exist', async () => {
      mockPrisma.block.findMany.mockResolvedValue([])

      const response = await request(app)
        .get('/api/blocks')
        .expect(200)

      expect(response.body).toEqual({
        blocks: [],
        total: 0
      })
    })
  })

  describe('GET /api/blocks/latest', () => {
    it('should return latest block with summary', async () => {
      const mockLatestBlock = {
        blockNumber: 100n,
        hash: '0xabc123',
        parentHash: '0xdef456',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        gasUsed: 1000n,
        gasLimit: 2000n,
        baseFeeWei: 50n,
        transactions: [
          {
            valueWei: 1000n,
            gasPriceWei: 20n
          },
          {
            valueWei: 2000n,
            gasPriceWei: 30n
          },
          {
            valueWei: 500n,
            gasPriceWei: null
          }
        ]
      }

      mockPrisma.block.findFirst.mockResolvedValue(mockLatestBlock)

      const response = await request(app)
        .get('/api/blocks/latest')
        .expect(200)

      expect(response.body).toEqual({
        blockNumber: '100',
        hash: '0xabc123',
        parentHash: '0xdef456',
        timestamp: mockLatestBlock.timestamp.toISOString(),
        gasUsed: '1000',
        gasLimit: '2000',
        baseFeeWei: '50',
        txCount: 3,
        totalValueWei: '3500',
        avgGasPrice: '25'
      })

      expect(mockPrisma.block.findFirst).toHaveBeenCalledWith({
        orderBy: { blockNumber: 'desc' },
        include: { transactions: true }
      })
    })

    it('should handle avgGasPrice calculation when no transactions have gas prices', async () => {
      const mockLatestBlock = {
        blockNumber: 100n,
        hash: '0xabc123',
        parentHash: '0xdef456',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        gasUsed: 1000n,
        gasLimit: 2000n,
        baseFeeWei: 50n,
        transactions: [
          {
            valueWei: 1000n,
            gasPriceWei: null
          }
        ]
      }

      mockPrisma.block.findFirst.mockResolvedValue(mockLatestBlock)

      const response = await request(app)
        .get('/api/blocks/latest')
        .expect(200)

      expect(response.body.avgGasPrice).toBeNull()
    })

    it('should return 404 when no blocks exist', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/blocks/latest')
        .expect(404)

      expect(response.body).toEqual({ error: 'No blocks found' })
    })

    it('should handle database errors', async () => {
      mockPrisma.block.findFirst.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/blocks/latest')
        .expect(500)

      expect(response.body).toEqual({ error: 'Failed to fetch latest block' })
    })
  })

  describe('GET /api/blocks/:number', () => {
    it('should return block with full transactions', async () => {
      const mockBlock = {
        blockNumber: 100n,
        hash: '0xabc123',
        parentHash: '0xdef456',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        gasUsed: 1000n,
        gasLimit: 2000n,
        baseFeeWei: 50n,
        transactions: [
          {
            id: 'tx1',
            txHash: '0x111',
            from: '0xfrom1',
            to: '0xto1',
            valueWei: 1000n,
            gasUsed: 21000n,
            gasPriceWei: 20n,
            nonce: 1n
          },
          {
            id: 'tx2',
            txHash: '0x222',
            from: '0xfrom2',
            to: null,
            valueWei: 0n,
            gasUsed: 50000n,
            gasPriceWei: null,
            nonce: 2n
          }
        ]
      }

      mockPrisma.block.findUnique.mockResolvedValue(mockBlock)

      const response = await request(app)
        .get('/api/blocks/100')
        .expect(200)

      expect(response.body).toEqual({
        block: {
          blockNumber: '100',
          hash: '0xabc123',
          parentHash: '0xdef456',
          timestamp: mockBlock.timestamp.toISOString(),
          gasUsed: '1000',
          gasLimit: '2000',
          baseFeeWei: '50',
          transactions: [
            {
              id: 'tx1',
              txHash: '0x111',
              from: '0xfrom1',
              to: '0xto1',
              valueWei: '1000',
              gasUsed: '21000',
              gasPriceWei: '20',
              nonce: '1'
            },
            {
              id: 'tx2',
              txHash: '0x222',
              from: '0xfrom2',
              to: null,
              valueWei: '0',
              gasUsed: '50000',
              gasPriceWei: null,
              nonce: '2'
            }
          ]
        },
        transactionCount: 2
      })

      expect(mockPrisma.block.findUnique).toHaveBeenCalledWith({
        where: { blockNumber: 100n },
        include: { transactions: true }
      })
    })

    it('should return 400 for invalid block number', async () => {
      const response = await request(app)
        .get('/api/blocks/invalid')
        .expect(400)

      expect(response.body).toEqual({ error: 'Invalid block number' })
    })

    it('should return 400 for negative block number', async () => {
      const response = await request(app)
        .get('/api/blocks/-1')
        .expect(400)

      expect(response.body).toEqual({ error: 'Invalid block number' })
    })

    it('should return 404 when block not found', async () => {
      mockPrisma.block.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/blocks/999999')
        .expect(404)

      expect(response.body).toEqual({ error: 'Block not found' })
    })

    it('should handle database errors', async () => {
      mockPrisma.block.findUnique.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/blocks/100')
        .expect(500)

      expect(response.body).toEqual({ error: 'Failed to fetch block' })
    })

    it('should handle very large block numbers', async () => {
      const mockBlock = {
        blockNumber: BigInt('999999999999999999'),
        hash: '0xabc123',
        parentHash: '0xdef456',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        gasUsed: 1000n,
        gasLimit: 2000n,
        baseFeeWei: 50n,
        transactions: []
      }

      mockPrisma.block.findUnique.mockResolvedValue(mockBlock)

      const response = await request(app)
        .get('/api/blocks/999999999999999999')
        .expect(200)

      expect(response.body.block.blockNumber).toBe('999999999999999999')
    })
  })

  describe('CORS headers', () => {
    it('should include CORS headers for localhost:5173', async () => {
      mockPrisma.block.findMany.mockResolvedValue([])

      const response = await request(app)
        .get('/api/blocks')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })
  })
})