-- CreateTable
CREATE TABLE "blocks" (
    "blockNumber" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "parentHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "gasUsed" BIGINT NOT NULL,
    "gasLimit" BIGINT NOT NULL,
    "baseFeeWei" BIGINT,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("blockNumber")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT,
    "valueWei" BIGINT NOT NULL,
    "gasUsed" BIGINT NOT NULL,
    "gasPriceWei" BIGINT,
    "nonce" BIGINT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocks_blockNumber_key" ON "blocks"("blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_hash_key" ON "blocks"("hash");

-- CreateIndex
CREATE INDEX "blocks_blockNumber_idx" ON "blocks"("blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_txHash_key" ON "transactions"("txHash");

-- CreateIndex
CREATE INDEX "transactions_blockNumber_idx" ON "transactions"("blockNumber");

-- CreateIndex
CREATE INDEX "transactions_from_idx" ON "transactions"("from");

-- CreateIndex
CREATE INDEX "transactions_to_idx" ON "transactions"("to");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "blocks"("blockNumber") ON DELETE CASCADE ON UPDATE CASCADE;
