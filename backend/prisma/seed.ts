import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  const block1 = await prisma.block.create({
    data: {
      blockNumber: BigInt(12345678),
      hash: '0xabc123def4567890123456789012345678901234567890123456789012345678',
      parentHash: '0xdef4567890123456789012345678901234567890123456789012345678901234',
      timestamp: new Date('2023-01-01T12:00:00Z'),
      gasUsed: BigInt(15000000),
      gasLimit: BigInt(30000000),
      baseFeeWei: BigInt(20000000000),
      transactions: {
        create: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
            from: '0x1234567890123456789012345678901234567890',
            to: '0x9876543210987654321098765432109876543210',
            valueWei: BigInt(1000000000000000000),
            gasUsed: BigInt(21000),
            gasPriceWei: BigInt(20000000000),
            nonce: BigInt(123),
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            txHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
            from: '0x2345678901234567890123456789012345678901',
            to: '0x8765432109876543210987654321098765432109',
            valueWei: BigInt(500000000000000000),
            gasUsed: BigInt(25000),
            gasPriceWei: BigInt(25000000000),
            nonce: BigInt(456),
          }
        ]
      }
    }
  })

  const block2 = await prisma.block.create({
    data: {
      blockNumber: BigInt(12345679),
      hash: '0xbcd234efg5678901234567890123456789012345678901234567890123456789',
      parentHash: '0xabc123def4567890123456789012345678901234567890123456789012345678',
      timestamp: new Date('2023-01-01T12:15:00Z'),
      gasUsed: BigInt(18000000),
      gasLimit: BigInt(30000000),
      baseFeeWei: BigInt(22000000000),
      transactions: {
        create: [
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            txHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
            from: '0x3456789012345678901234567890123456789012',
            to: '0x7654321098765432109876543210987654321098',
            valueWei: BigInt(2000000000000000000),
            gasUsed: BigInt(30000),
            gasPriceWei: BigInt(22000000000),
            nonce: BigInt(789),
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440004',
            txHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
            from: '0x4567890123456789012345678901234567890123',
            valueWei: BigInt(750000000000000000),
            gasUsed: BigInt(28000),
            gasPriceWei: BigInt(23000000000),
            nonce: BigInt(1011),
          }
        ]
      }
    }
  })

  const block3 = await prisma.block.create({
    data: {
      blockNumber: BigInt(12345680),
      hash: '0xcde345fgh6789012345678901234567890123456789012345678901234567890',
      parentHash: '0xbcd234efg5678901234567890123456789012345678901234567890123456789',
      timestamp: new Date('2023-01-01T12:30:00Z'),
      gasUsed: BigInt(12000000),
      gasLimit: BigInt(30000000),
      baseFeeWei: BigInt(18000000000),
      transactions: {
        create: [
          {
            id: '550e8400-e29b-41d4-a716-446655440005',
            txHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
            from: '0x5678901234567890123456789012345678901234',
            to: '0x6543210987654321098765432109876543210987',
            valueWei: BigInt(3000000000000000000),
            gasUsed: BigInt(35000),
            gasPriceWei: BigInt(18000000000),
            nonce: BigInt(1213),
          }
        ]
      }
    }
  })

  console.log('Created blocks:', { block1: block1.blockNumber, block2: block2.blockNumber, block3: block3.blockNumber })
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })