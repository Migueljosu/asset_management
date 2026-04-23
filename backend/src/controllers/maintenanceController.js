const prisma = require("../utils/prisma");
const { createNotification } = require("./notificationController");

// Helper para notificar todos os admins
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

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "INICIAR_MANUTENCAO",
          tabelaAfetada: "Maintenance",
          registroId: maintenance.id,
        },
      });

      return { maintenance, equipment };
    });

    // Notificar admins que técnico iniciou manutenção
    await notifyAdmins(
      "Manutenção Iniciada",
      `O técnico iniciou manutenção no equipamento ${result.equipment.nome} (${result.equipment.codigo}). Tipo: ${tipo}.`,
      "warning"
    );

    res.json({
      success: true,
      data: result.maintenance,
    });
  } catch (error) {
    console.error("[startMaintenance]", error);
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
        include: { equipment: true },
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

      await tx.anomaly.updateMany({
        where: {
          equipmentId: maintenance.equipmentId,
          estado: { not: "resolvida" },
        },
        data: {
          estado: "resolvida",
        },
      });

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "FINALIZAR_MANUTENCAO",
          tabelaAfetada: "Maintenance",
          registroId: maintenance.id,
        },
      });

      return maintenance;
    });

    // Notificar admin e técnico que a manutenção foi concluída
    await notifyAdmins(
      "Manutenção Concluída",
      `A manutenção do equipamento ${result.equipment.nome} (${result.equipment.codigo}) foi concluída com sucesso.`,
      "success"
    );

    await createNotification(
      result.tecnicoId,
      "Manutenção Concluída",
      `A manutenção do equipamento ${result.equipment.nome} (${result.equipment.codigo}) foi concluída com sucesso.`,
      "success"
    );

    res.json({
      success: true,
      message: "Manutenção concluída",
    });
  } catch (error) {
    console.error("[finishMaintenance]", error);
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
  } catch (error) {
    console.error("[getAllMaintenances]", error);
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
  } catch (error) {
    console.error("[getMaintenanceById]", error);
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
        include: { equipment: true },
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

      return maintenance;
    });

    // Notificar admins que técnico cancelou manutenção
    await notifyAdmins(
      "Manutenção Cancelada",
      `O técnico cancelou a manutenção do equipamento ${result.equipment.nome} (${result.equipment.codigo}).`,
      "warning"
    );

    res.json({
      success: true,
      message: "Manutenção cancelada",
    });
  } catch (error) {
    console.error("[cancelMaintenance]", error);
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
