
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing Charts Query...')
    try {
        const chartsQuery = `
      SELECT
        b."blockNumber" as block_number,
        COUNT(t.id) as tx_count,
        COALESCE(SUM(t."valueWei"), 0) as total_value_wei
      FROM blocks b
      LEFT JOIN transactions t ON b."blockNumber" = t."blockNumber"
      GROUP BY b."blockNumber", b."timestamp"
      ORDER BY b."blockNumber" DESC
      LIMIT 5
    `
        const chartsResult = await prisma.$queryRawUnsafe(chartsQuery)
        console.log('Charts Result:', JSON.parse(JSON.stringify(chartsResult, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )))
    } catch (e) {
        console.error('Charts Query Failed:', e)
    }

    console.log('\nTesting Stats (Top Senders) Query...')
    try {
        const statsQuery = `
      SELECT
        "from" as address,
        COUNT(*) as tx_count,
        COALESCE(SUM("valueWei"), 0) as total_value
      FROM transactions
      WHERE "blockNumber" IN (
        SELECT "blockNumber"
        FROM blocks
        ORDER BY "blockNumber" DESC
        LIMIT 5
      )
      GROUP BY "from"
      ORDER BY tx_count DESC, total_value DESC
      LIMIT 10
    `
        const statsResult = await prisma.$queryRawUnsafe(statsQuery)
        console.log('Stats Result:', JSON.parse(JSON.stringify(statsResult, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )))
    } catch (e) {
        console.error('Stats Query Failed:', e)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
