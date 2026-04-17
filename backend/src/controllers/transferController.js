const prisma = require("../utils/prisma");

const createTransfer = async (req, res) => {
  const { equipmentId, setorOrigemId, setorDestinoId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!equipment) {
        throw new Error("Equipamento não encontrado");
      }

      if (equipment.estado === "em_uso") {
        throw new Error("Equipamento está em uso");
      }

      if (equipment.estado === "manutencao") {
        throw new Error("Equipamento em manutenção");
      }

      if (setorOrigemId === setorDestinoId) {
        throw new Error("Origem e destino iguais");
      }

      const transfer = await tx.transfer.create({
        data: {
          equipmentId,
          setorOrigemId,
          setorDestinoId,
        },
      });

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "TRANSFERENCIA_EQUIPAMENTO",
          tabelaAfetada: "Transfer",
          registroId: transfer.id,
        },
      });

      return transfer;
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getAllTransfers = async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        equipment: true,
        setorOrigem: true,
        setorDestino: true,
      },
      orderBy: { dataTransferencia: "desc" },
    });

    res.json({
      success: true,
      data: transfers,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const getTransferById = async (req, res) => {
  const { id } = req.params;

  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: Number(id) },
      include: {
        equipment: true,
        setorOrigem: true,
        setorDestino: true,
      },
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: "Transferência não encontrada",
      });
    }

    res.json({
      success: true,
      data: transfer,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const getTransfersByEquipment = async (req, res) => {
  const { equipmentId } = req.params;

  try {
    const transfers = await prisma.transfer.findMany({
      where: { equipmentId: Number(equipmentId) },
      include: {
        setorOrigem: true,
        setorDestino: true,
      },
      orderBy: { dataTransferencia: "desc" },
    });

    res.json({
      success: true,
      data: transfers,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

module.exports = {
  createTransfer,
  getAllTransfers,
  getTransferById,
  getTransfersByEquipment,
};