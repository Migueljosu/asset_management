const prisma = require("../utils/prisma");

const createTransfer = async (req, res) => {
  const { equipmentId, setorDestinoId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.findUnique({
        where: { id: Number(equipmentId) },
      });

      if (!equipment) {
        throw new Error("Equipamento não encontrado");
      }

      if (equipment.estado !== "em_uso") {
        throw new Error("Apenas equipamentos em uso podem ser transferidos");
      }

      const activeLoan = await tx.loan.findFirst({
        where: {
          equipmentId: Number(equipmentId),
          estado: "ativo",
        },
        orderBy: { createdAt: "desc" },
      });

      if (!activeLoan) {
        throw new Error("Não existe empréstimo ativo para este equipamento");
      }

      if (activeLoan.setorDestinoId === Number(setorDestinoId)) {
        throw new Error("Origem e destino iguais");
      }

      const transfer = await tx.transfer.create({
        data: {
          equipmentId: Number(equipmentId),
          setorOrigemId: activeLoan.setorDestinoId,
          setorDestinoId: Number(setorDestinoId),
        },
        include: {
          equipment: true,
          setorOrigem: true,
          setorDestino: true,
        },
      });

      await tx.loan.update({
        where: { id: activeLoan.id },
        data: {
          setorDestinoId: Number(setorDestinoId),
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

    res.status(201).json({
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

const getTransferableEquipments = async (req, res) => {
  try {
    const activeLoans = await prisma.loan.findMany({
      where: {
        estado: "ativo",
        equipment: {
          estado: "em_uso",
        },
      },
      include: {
        equipment: true,
        setorDestino: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const items = activeLoans.map((loan) => ({
      equipmentId: loan.equipmentId,
      equipmentName: loan.equipment.nome,
      currentSectorId: loan.setorDestinoId,
      currentSectorName: loan.setorDestino.nome,
      loanId: loan.id,
    }));

    res.json({
      success: true,
      data: items,
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
  getTransferableEquipments,
};
