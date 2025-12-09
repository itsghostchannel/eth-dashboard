import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

interface AddressStats {
  address: string
  txCount: number
  totalValue: string
}

interface GasSpenderStats {
  address: string
  totalGasFeesWei: string
}

router.get('/top-senders', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        from_address as address,
        COUNT(*) as tx_count,
        COALESCE(SUM(value_wei), 0) as total_value
      FROM transactions
      WHERE block_number >= (
        SELECT block_number
        FROM blocks
        ORDER BY block_number DESC
        LIMIT 1 OFFSET 4
      )
      GROUP BY from_address
      ORDER BY tx_count DESC, total_value DESC
      LIMIT 10
    `

    const results = await prisma.$queryRaw<Array<{
      address: string
      tx_count: bigint
      total_value: bigint
    }>>(query)

    const topSenders: AddressStats[] = results.map(result => ({
      address: result.address,
      txCount: Number(result.tx_count),
      totalValue: result.total_value.toString()
    }))

    res.json({
      topSenders,
      total: topSenders.length
    })
  } catch (error) {
    console.error('Error fetching top senders:', error)
    res.status(500).json({ error: 'Failed to fetch top senders' })
  }
})

router.get('/top-receivers', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        to_address as address,
        COUNT(*) as tx_count,
        COALESCE(SUM(value_wei), 0) as total_value
      FROM transactions
      WHERE block_number >= (
        SELECT block_number
        FROM blocks
        ORDER BY block_number DESC
        LIMIT 1 OFFSET 4
      )
      AND to_address IS NOT NULL
      GROUP BY to_address
      ORDER BY tx_count DESC, total_value DESC
      LIMIT 10
    `

    const results = await prisma.$queryRaw<Array<{
      address: string
      tx_count: bigint
      total_value: bigint
    }>>(query)

    const topReceivers: AddressStats[] = results.map(result => ({
      address: result.address,
      txCount: Number(result.tx_count),
      totalValue: result.total_value.toString()
    }))

    res.json({
      topReceivers,
      total: topReceivers.length
    })
  } catch (error) {
    console.error('Error fetching top receivers:', error)
    res.status(500).json({ error: 'Failed to fetch top receivers' })
  }
})

router.get('/top-gas-spenders', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        from_address as address,
        COALESCE(SUM(gas_used * COALESCE(gas_price_wei, 0)), 0) as total_gas_fees_wei
      FROM transactions
      WHERE block_number >= (
        SELECT block_number
        FROM blocks
        ORDER BY block_number DESC
        LIMIT 1 OFFSET 4
      )
      GROUP BY from_address
      ORDER BY total_gas_fees_wei DESC
      LIMIT 10
    `

    const results = await prisma.$queryRaw<Array<{
      address: string
      total_gas_fees_wei: bigint
    }>>(query)

    const topGasSpenders: GasSpenderStats[] = results.map(result => ({
      address: result.address,
      totalGasFeesWei: result.total_gas_fees_wei.toString()
    }))

    res.json({
      topGasSpenders,
      total: topGasSpenders.length
    })
  } catch (error) {
    console.error('Error fetching top gas spenders:', error)
    res.status(500).json({ error: 'Failed to fetch top gas spenders' })
  }
})

export default router