import prisma from '../prisma'
import pino from 'pino'
import { fetchBlock } from '../lib/ethereum'
import { getPollInterval, getMaxBlocks, validateConfig } from './config'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV !== 'test' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  })
})

let pollerTimeout: NodeJS.Timeout | null = null
let isPolling = false

async function getLatestBlockNumber(): Promise<bigint | null> {
  try {
    const latestBlock = await prisma.block.findFirst({
      orderBy: {
        blockNumber: 'desc'
      },
      select: {
        blockNumber: true
      }
    })

    return latestBlock ? BigInt(latestBlock.blockNumber) : null
  } catch (error) {
    logger.error({ error }, 'Failed to get latest block number from database')
    return null
  }
}

async function upsertBlock(blockData: any, blockNumber: bigint, gasUsed: bigint, gasLimit: bigint, baseFeeWei?: bigint) {
  return prisma.block.upsert({
    where: {
      blockNumber
    },
    update: {
      hash: blockData.hash,
      parentHash: blockData.parentHash,
      timestamp: new Date(parseInt(blockData.timestamp, 16) * 1000),
      gasUsed,
      gasLimit,
      baseFeeWei
    },
    create: {
      blockNumber,
      hash: blockData.hash,
      parentHash: blockData.parentHash,
      timestamp: new Date(parseInt(blockData.timestamp, 16) * 1000),
      gasUsed,
      gasLimit,
      baseFeeWei
    }
  })
}

async function bulkCreateTransactions(transactions: any[]) {
  if (transactions.length === 0) return

  try {
    await prisma.transaction.createMany({
      data: transactions,
      skipDuplicates: true
    })
    logger.info({ count: transactions.length }, 'Created new transactions')
  } catch (error) {
    logger.error({ error, count: transactions.length }, 'Failed to bulk create transactions')
    throw error
  }
}

async function deleteOldBlocks(latestBlockNumber: bigint) {
  const maxBlocks = getMaxBlocks()
  const cutoffBlockNumber = latestBlockNumber - BigInt(maxBlocks)

  if (cutoffBlockNumber < 0n) return

  try {
    const result = await prisma.block.deleteMany({
      where: {
        blockNumber: {
          lt: cutoffBlockNumber
        }
      }
    })

    if (result.count > 0) {
      logger.info({
        deletedBlocks: result.count,
        cutoffBlockNumber: cutoffBlockNumber.toString()
      }, 'Deleted old blocks')
    }
  } catch (error) {
    logger.error({ error, cutoffBlockNumber }, 'Failed to delete old blocks')
    throw error
  }
}

async function pollBlock(): Promise<void> {
  try {
    logger.debug('Starting block poll')

    const fetchResult = await fetchBlock()
    const { block, blockNumber, gasUsed, gasLimit, baseFeeWei, transactions } = fetchResult

    logger.info({
      blockNumber: blockNumber.toString(),
      blockHash: block.hash,
      transactionCount: transactions.length
    }, 'Fetched latest block')

    const latestDbBlockNumber = await getLatestBlockNumber()

    if (latestDbBlockNumber === null) {
      logger.info('No existing blocks found, inserting first block')
    } else if (blockNumber <= latestDbBlockNumber) {
      logger.debug({
        fetchedBlock: blockNumber.toString(),
        latestDbBlock: latestDbBlockNumber.toString()
      }, 'Block already exists in database, skipping')
      return
    } else {
      logger.info({
        newBlock: blockNumber.toString(),
        previousBlock: latestDbBlockNumber.toString()
      }, 'New block detected')
    }

    await prisma.$transaction(async (tx) => {
      await upsertBlock(block, blockNumber, gasUsed, gasLimit, baseFeeWei)
      await bulkCreateTransactions(transactions)
      await deleteOldBlocks(blockNumber)
    })

    logger.info({ blockNumber: blockNumber.toString() }, 'Successfully processed block')
  } catch (error) {
    logger.error({ error }, 'Error during block polling')
  }
}

export function startPoller(): void {
  try {
    const pollInterval = getPollInterval()
    const maxBlocks = getMaxBlocks()

    validateConfig()

    const pollLoop = async () => {
      if (!isPolling) return

      try {
        await pollBlock()
      } catch (error) {
        logger.error({ error }, 'Error in poll loop')
      } finally {
        if (isPolling) {
          pollerTimeout = setTimeout(pollLoop, pollInterval)
        }
      }
    }

    logger.info({
      pollInterval,
      maxBlocks
    }, 'Starting Ethereum block poller')

    isPolling = true
    pollLoop()

    logger.info('Poller started successfully')
  } catch (error) {
    logger.error({ error }, 'Failed to start poller')
    throw error
  }
}

export function stopPoller(): void {
  isPolling = false
  if (pollerTimeout) {
    clearTimeout(pollerTimeout)
    pollerTimeout = null
    logger.info('Poller stopped')
  }
}

export async function gracefulShutdown(): Promise<void> {
  logger.info('Starting graceful shutdown')

  stopPoller()

  await prisma.$disconnect()

  logger.info('Graceful shutdown completed')
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)