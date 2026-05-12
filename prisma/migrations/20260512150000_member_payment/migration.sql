-- CreateTable
CREATE TABLE "MemberPayment" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "amountWon" INTEGER NOT NULL,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberPayment_groupId_idx" ON "MemberPayment"("groupId");

-- CreateIndex
CREATE INDEX "MemberPayment_fromUserId_idx" ON "MemberPayment"("fromUserId");

-- CreateIndex
CREATE INDEX "MemberPayment_toUserId_idx" ON "MemberPayment"("toUserId");

-- AddForeignKey
ALTER TABLE "MemberPayment" ADD CONSTRAINT "MemberPayment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPayment" ADD CONSTRAINT "MemberPayment_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPayment" ADD CONSTRAINT "MemberPayment_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPayment" ADD CONSTRAINT "MemberPayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
