import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

interface BlockVolumeStats {
  blockNumber: string
  txCount: number
  totalValueWei: string
  totalGasUsed: string
  avgGasPriceWei: string
}

router.get('/volume-per-block', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        b."blockNumber" as block_number,
        COUNT(t.id) as tx_count,
        COALESCE(SUM(t."valueWei"), 0) as total_value_wei,
        COALESCE(SUM(t."gasUsed"), 0) as total_gas_used,
        COALESCE(AVG(t."gasPriceWei"), 0) as avg_gas_price_wei
      FROM blocks b
      LEFT JOIN transactions t ON b."blockNumber" = t."blockNumber"
      GROUP BY b."blockNumber", b."timestamp"
      ORDER BY b."blockNumber" DESC
      LIMIT 5
    `

    const results = await prisma.$queryRawUnsafe<Array<{
      block_number: bigint
      tx_count: bigint
      total_value_wei: bigint
      total_gas_used: bigint
      avg_gas_price_wei: bigint
    }>>(query)

    const volumeStats: BlockVolumeStats[] = results.map(result => ({
      blockNumber: result.block_number.toString(),
      txCount: Number(result.tx_count),
      totalValueWei: result.total_value_wei.toString(),
      totalGasUsed: result.total_gas_used.toString(),
      avgGasPriceWei: result.avg_gas_price_wei.toString()
    }))

    res.json({
      volumeStats,
      total: volumeStats.length
    })
  } catch (error) {
    console.error('Error fetching volume per block:', error)
    res.status(500).json({ error: 'Failed to fetch volume per block' })
  }
})

export default router