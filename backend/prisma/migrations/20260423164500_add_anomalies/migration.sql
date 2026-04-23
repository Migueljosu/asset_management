-- CreateEnum
CREATE TYPE "EstadoAnomaly" AS ENUM ('reportada', 'em_analise', 'resolvida');

-- CreateEnum
CREATE TYPE "SeveridadeAnomaly" AS ENUM ('baixa', 'media', 'alta');

-- CreateTable
CREATE TABLE "Anomaly" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "estado" "EstadoAnomaly" NOT NULL DEFAULT 'reportada',
    "severidade" "SeveridadeAnomaly" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anomaly_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
