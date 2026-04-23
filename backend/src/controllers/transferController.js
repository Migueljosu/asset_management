const prisma = require("../utils/prisma");
const { createNotification } = require("./notificationController");

const notifyAdmins = async (titulo, mensagem, tipo = "info") => {
  try {
    const admins = await prisma.user.findMany({
      where: { perfil: "admin" },
      select: { id: true },
    });
    for (const u of admins) {
      await createNotification(u.id, titulo, mensagem, tipo);
    }
  } catch (e) {
    console.error("[notifyAdmins] erro:", e);
  }
};

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

    // Notificar admin que equipamento foi transferido
    await notifyAdmins(
      "Transferência de Equipamento",
      `O equipamento ${result.equipment.nome} (${result.equipment.codigo}) foi transferido do setor ${result.setorOrigem.nome} para ${result.setorDestino.nome}.`,
      "info"
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[createTransfer]", error);
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
  } catch (error) {
    console.error("[getAllTransfers]", error);
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
  } catch (error) {
    console.error("[getTransferById]", error);
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
  } catch (error) {
    console.error("[getTransfersByEquipment]", error);
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
  } catch (error) {
    console.error("[getTransferableEquipments]", error);
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

