const prisma = require("../utils/prisma");

const startMaintenance = async (req, res) => {
  const { equipmentId, tipo, descricao } = req.body;

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
        throw new Error("Já está em manutenção");
      }

      const maintenance = await tx.maintenance.create({
        data: {
          equipmentId,
          tecnicoId: req.user.id,
          tipo,
          descricao,
          dataInicio: new Date(),
          estado: "em_andamento",
        },
      });

      await tx.equipment.update({
        where: { id: equipmentId },
        data: { estado: "manutencao" },
      });

      // log
      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "INICIAR_MANUTENCAO",
          tabelaAfetada: "Maintenance",
          registroId: maintenance.id,
        },
      });

      return maintenance;
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

const finishMaintenance = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.findUnique({
        where: { id: Number(id) },
      });

      if (!maintenance || maintenance.estado !== "em_andamento") {
        throw new Error("Manutenção inválida");
      }

      await tx.maintenance.update({
        where: { id: Number(id) },
        data: {
          estado: "concluida",
          dataFim: new Date(),
        },
      });

      await tx.equipment.update({
        where: { id: maintenance.equipmentId },
        data: { estado: "disponivel" },
      });

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "FINALIZAR_MANUTENCAO",
          tabelaAfetada: "Maintenance",
          registroId: maintenance.id,
        },
      });

      return true;
    });

    res.json({
      success: true,
      message: "Manutenção concluída",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getAllMaintenances = async (req, res) => {
  try {
    const maintenances = await prisma.maintenance.findMany({
      include: {
        equipment: true,
        tecnico: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: maintenances,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const getMaintenanceById = async (req, res) => {
  const { id } = req.params;

  try {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: Number(id) },
      include: {
        equipment: true,
        tecnico: true,
      },
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: "Não encontrada",
      });
    }

    res.json({
      success: true,
      data: maintenance,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const cancelMaintenance = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.findUnique({
        where: { id: Number(id) },
      });

      if (!maintenance || maintenance.estado !== "em_andamento") {
        throw new Error("Não pode cancelar");
      }

      await tx.maintenance.update({
        where: { id: Number(id) },
        data: {
          estado: "concluida",
          dataFim: new Date(),
        },
      });

      await tx.equipment.update({
        where: { id: maintenance.equipmentId },
        data: { estado: "disponivel" },
      });

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "CANCELAR_MANUTENCAO",
          tabelaAfetada: "Maintenance",
          registroId: maintenance.id,
        },
      });

      return true;
    });

    res.json({
      success: true,
      message: "Manutenção cancelada",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  startMaintenance,
  finishMaintenance,
  getAllMaintenances,
  getMaintenanceById,
  cancelMaintenance,
};