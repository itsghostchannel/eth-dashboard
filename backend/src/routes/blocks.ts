import { Router, Request, Response } from 'express'
import prisma from '../prisma'

import { runSinglePoll } from '../services/poller'

const router = Router()

// Trigger manual poll (for on-demand updates or scheduled jobs)
router.post('/sync', async (req: Request, res: Response) => {
  try {
    await runSinglePoll()
    res.json({ status: 'success', message: 'Blockchain data synced' })
  } catch (error) {
    console.error('Manual sync failed:', error)
    res.status(500).json({ error: 'Failed to sync blockchain data' })
  }
})

interface BlockWithTransactions {
  blockNumber: bigint
  hash: string
  parentHash: string
  timestamp: Date
  gasUsed: bigint
  gasLimit: bigint
  baseFeeWei: bigint | null
  transactions: {
    id: string
    txHash: string
    from: string
    to: string | null
    valueWei: bigint
    gasUsed: bigint
    gasPriceWei: bigint | null
    nonce: bigint
  }[]
}

interface BlockWithTxCount {
  blockNumber: bigint
  hash: string
  parentHash: string
  timestamp: Date
  gasUsed: bigint
  gasLimit: bigint
  baseFeeWei: bigint | null
  txCount: number
}

interface BlockSummary {
  blockNumber: bigint
  hash: string
  parentHash: string
  timestamp: Date
  gasUsed: bigint
  gasLimit: bigint
  baseFeeWei: bigint | null
  txCount: number
  totalValueWei: bigint
  avgGasPrice: bigint | null
}

router.get('/', async (req: Request, res: Response) => {
  try {

    const blocks = await prisma.block.findMany({
      orderBy: {
        blockNumber: 'desc'
      },
      take: 5,
      include: {
        transactions: true
      }
    })

    const blocksWithTxCount: BlockWithTxCount[] = blocks.map(block => ({
      blockNumber: block.blockNumber,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
      gasUsed: block.gasUsed,
      gasLimit: block.gasLimit,
      baseFeeWei: block.baseFeeWei,
      txCount: block.transactions.length
    }))

    res.json({
      blocks: blocksWithTxCount,
      total: blocksWithTxCount.length
    })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    res.status(500).json({ error: 'Failed to fetch blocks' })
  }
})

router.get('/latest', async (req: Request, res: Response) => {
  try {

    const latestBlock = await prisma.block.findFirst({
      orderBy: {
        blockNumber: 'desc'
      },
      include: {
        transactions: true
      }
    })

    if (!latestBlock) {
      return res.status(404).json({ error: 'No blocks found' })
    }

    const totalValueWei = latestBlock.transactions.reduce(
      (sum, tx) => sum + tx.valueWei,
      0n
    )

    const gasPrices = latestBlock.transactions
      .filter(tx => tx.gasPriceWei !== null)
      .map(tx => tx.gasPriceWei!)

    const avgGasPrice = gasPrices.length > 0
      ? gasPrices.reduce((sum, price) => sum + price, 0n) / BigInt(gasPrices.length)
      : null

    const blockSummary: BlockSummary = {
      blockNumber: latestBlock.blockNumber,
      hash: latestBlock.hash,
      parentHash: latestBlock.parentHash,
      timestamp: latestBlock.timestamp,
      gasUsed: latestBlock.gasUsed,
      gasLimit: latestBlock.gasLimit,
      baseFeeWei: latestBlock.baseFeeWei,
      txCount: latestBlock.transactions.length,
      totalValueWei,
      avgGasPrice
    }

    res.json(blockSummary)
  } catch (error) {
    console.error('Error fetching latest block:', error)
    res.status(500).json({ error: 'Failed to fetch latest block' })
  }
})

router.get('/:number', async (req: Request, res: Response) => {
  try {
    const { number } = req.params

    if (!number || !/^\d+$/.test(number)) {
      return res.status(400).json({ error: 'Invalid block number' })
    }

    const blockNumber = BigInt(number)


    const block = await prisma.block.findUnique({
      where: {
        blockNumber
      },
      include: {
        transactions: true
      }
    })

    if (!block) {
      return res.status(404).json({ error: 'Block not found' })
    }

    const blockWithTransactions: BlockWithTransactions = {
      blockNumber: block.blockNumber,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
      gasUsed: block.gasUsed,
      gasLimit: block.gasLimit,
      baseFeeWei: block.baseFeeWei,
      transactions: block.transactions.map(tx => ({
        id: tx.id,
        txHash: tx.txHash,
        from: tx.from,
        to: tx.to,
        valueWei: tx.valueWei,
        gasUsed: tx.gasUsed,
        gasPriceWei: tx.gasPriceWei,
        nonce: tx.nonce
      }))
    }

    res.json({
      block: blockWithTransactions,
      transactionCount: blockWithTransactions.transactions.length
    })
  } catch (error) {
    console.error('Error fetching block:', error)
    res.status(500).json({ error: 'Failed to fetch block' })
  }
})

export default router