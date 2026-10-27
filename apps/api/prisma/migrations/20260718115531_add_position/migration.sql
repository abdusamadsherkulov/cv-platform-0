-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectTags" TEXT[],
    "maxProjects" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionAttribute" (
    "id" SERIAL NOT NULL,
    "positionId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,

    CONSTRAINT "PositionAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionAccessRule" (
    "id" SERIAL NOT NULL,
    "positionId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PositionAccessRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PositionAttribute" ADD CONSTRAINT "PositionAttribute_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionAttribute" ADD CONSTRAINT "PositionAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionAccessRule" ADD CONSTRAINT "PositionAccessRule_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionAccessRule" ADD CONSTRAINT "PositionAccessRule_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
