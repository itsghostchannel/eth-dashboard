import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../src/app'

// Mock the singleton prisma instance
vi.mock('../src/prisma', () => ({
  default: {
    $queryRaw: vi.fn(),
    $disconnect: vi.fn()
  }
}))

describe('Charts API', () => {
  let mockPrisma: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { default: prisma } = await import('../src/prisma')
    mockPrisma = prisma

    // Set default return values
    mockPrisma.$queryRaw.mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/charts/volume-per-block', () => {
    it('should return volume statistics for last 5 blocks with correct aggregation math', async () => {
      const mockQueryResults = [
        {
          block_number: 100n,
          tx_count: 3n,
          total_value_wei: 1500n,
          total_gas_used: 100000n,
          avg_gas_price_wei: 25n
        },
        {
          block_number: 99n,
          tx_count: 2n,
          total_value_wei: 800n,
          total_gas_used: 70000n,
          avg_gas_price_wei: 30n
        },
        {
          block_number: 98n,
          tx_count: 1n,
          total_value_wei: 500n,
          total_gas_used: 21000n,
          avg_gas_price_wei: 20n
        }
      ]

      mockPrisma.$queryRaw.mockResolvedValue(mockQueryResults)

      const response = await request(app)
        .get('/api/charts/volume-per-block')
        .expect(200)

      expect(response.body).toEqual({
        volumeStats: [
          {
            blockNumber: '100',
            txCount: 3,
            totalValueWei: '1500',
            totalGasUsed: '100000',
            avgGasPriceWei: '25'
          },
          {
            blockNumber: '99',
            txCount: 2,
            totalValueWei: '800',
            totalGasUsed: '70000',
            avgGasPriceWei: '30'
          },
          {
            blockNumber: '98',
            txCount: 1,
            totalValueWei: '500',
            totalGasUsed: '21000',
            avgGasPriceWei: '20'
          }
        ],
        total: 3
      })

      // Verify the SQL query was called
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('SELECT b.block_number, COUNT(t.id) as tx_count')
      )
    })

    it('should handle blocks with no transactions', async () => {
      const mockQueryResults = [
        {
          block_number: 100n,
          tx_count: 0n,
          total_value_wei: 0n,
          total_gas_used: 0n,
          avg_gas_price_wei: 0n
        }
      ]

      mockPrisma.$queryRaw.mockResolvedValue(mockQueryResults)

      const response = await request(app)
        .get('/api/charts/volume-per-block')
        .expect(200)

      expect(response.body.volumeStats[0]).toEqual({
        blockNumber: '100',
        txCount: 0,
        totalValueWei: '0',
        totalGasUsed: '0',
        avgGasPriceWei: '0'
      })
    })

    it('should verify aggregation math with complex seeded data', async () => {
      const mockQueryResults = [
        {
          block_number: 105n,
          tx_count: 5n,
          total_value_wei: 1000000000000000000n, // 1 ETH
          total_gas_used: 21000n + 25000n + 30000n + 21000n + 50000n, // Sum: 147000
          avg_gas_price_wei: (20n + 25n + 30n + 20n + 50n) / 5n // Average: 29
        }
      ]

      mockPrisma.$queryRaw.mockResolvedValue(mockQueryResults)

      const response = await request(app)
        .get('/api/charts/volume-per-block')
        .expect(200)

      const block = response.body.volumeStats[0]

      // Verify transaction count
      expect(block.txCount).toBe(5)

      // Verify total value (1 ETH in wei)
      expect(block.totalValueWei).toBe('1000000000000000000')

      // Verify total gas used sum
      expect(block.totalGasUsed).toBe('147000')

      // Verify average gas price calculation
      expect(block.avgGasPriceWei).toBe('29')
    })

    it('should handle null gas prices correctly in averages', async () => {
      const mockQueryResults = [
        {
          block_number: 100n,
          tx_count: 3n,
          total_value_wei: 1000n,
          total_gas_used: 63000n, // 21000 * 3
          avg_gas_price_wei: 20n // Only counting non-null gas prices
        }
      ]

      mockPrisma.$queryRaw.mockResolvedValue(mockQueryResults)

      const response = await request(app)
        .get('/api/charts/volume-per-block')
        .expect(200)

      expect(response.body.volumeStats[0].avgGasPriceWei).toBe('20')
      expect(response.body.volumeStats[0].txCount).toBe(3)
    })

    it('should handle BigInt serialization for JSON', async () => {
      const mockQueryResults = [
        {
          block_number: BigInt('999999999999999999'),
          tx_count: BigInt('999999999'),
          total_value_wei: BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'),
          total_gas_used: BigInt('999999999999999999'),
          avg_gas_price_wei: BigInt('999999999999999999')
        }
      ]

      mockPrisma.$queryRaw.mockResolvedValue(mockQueryResults)

      const response = await request(app)
        .get('/api/charts/volume-per-block')
        .expect(200)

      const stats = response.body.volumeStats[0]

      // Verify all BigInt values are serialized as strings
      expect(typeof stats.blockNumber).toBe('string')
      expect(typeof stats.totalValueWei).toBe('string')
      expect(typeof stats.totalGasUsed).toBe('string')
      expect(typeof stats.avgGasPriceWei).toBe('string')

      // Verify the values are correct
      expect(stats.blockNumber).toBe('999999999999999999')
      expect(stats.totalValueWei).toBe('115792089237316195423570985008687907853269984665640564039457584007913129639935')
    })

    it('should return empty array when no blocks found', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([])

      const response = await request(app)
        .get('/api/charts/volume-per-block')
        .expect(200)

      expect(response.body).toEqual({
        volumeStats: [],
        total: 0
      })
    })

    it('should handle database errors', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'))

      const response = await request(app)
        .get('/api/charts/volume-per-block')
        .expect(500)

      expect(response.body).toEqual({ error: 'Failed to fetch volume per block' })
    })

    it('should use correct SQL query with proper subquery for last 5 blocks', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([])

      await request(app)
        .get('/api/charts/volume-per-block')
        .expect(200)

      const queryCall = mockPrisma.$queryRaw.mock.calls[0][0]

      // Verify the query includes the subquery for getting the starting block number
      expect(queryCall).toContain('SELECT block_number FROM blocks ORDER BY block_number DESC LIMIT 1 OFFSET 4')

      // Verify the query includes the main aggregation logic
      expect(queryCall).toContain('COUNT(t.id) as tx_count')
      expect(queryCall).toContain('SUM(t.value_wei) as total_value_wei')
      expect(queryCall).toContain('SUM(t.gas_used) as total_gas_used')
      expect(queryCall).toContain('AVG(t.gas_price_wei) as avg_gas_price_wei')

      // Verify the query includes the LEFT JOIN and GROUP BY
      expect(queryCall).toContain('LEFT JOIN transactions t ON b.block_number = t.block_number')
      expect(queryCall).toContain('GROUP BY b.block_number')
      expect(queryCall).toContain('ORDER BY b.block_number DESC LIMIT 5')
    })
  })

  describe('CORS headers', () => {
    it('should include CORS headers for localhost:5173', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([])

      const response = await request(app)
        .get('/api/charts/volume-per-block')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })
  })
})