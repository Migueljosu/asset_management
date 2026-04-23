const prisma = require("../utils/prisma");
const { createNotification } = require("./notificationController");

const createAnomaly = async (req, res) => {
  const { equipmentId, titulo, descricao, severidade } = req.body;

  try {
    if (!equipmentId || !titulo || !descricao || !severidade) {
      return res.status(400).json({
        success: false,
        error: "equipmentId, titulo, descricao e severidade são obrigatórios",
      });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: Number(equipmentId) },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: "Equipamento não encontrado",
      });
    }

    const anomaly = await prisma.anomaly.create({
      data: {
        userId: req.user.id,
        equipmentId: Number(equipmentId),
        titulo,
        descricao,
        severidade,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        equipment: true,
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "CRIAR_ANOMALIA",
        tabelaAfetada: "Anomaly",
        registroId: anomaly.id,
        equipmentId: anomaly.equipmentId,
      },
    });

    // Notificar admin e técnicos
    const adminsETecnicos = await prisma.user.findMany({
      where: {
        perfil: { in: ["admin", "tecnico"] },
      },
      select: { id: true },
    });

    for (const u of adminsETecnicos) {
      await createNotification(
        u.id,
        "Nova Anomalia Reportada",
        `O equipamento ${equipment.nome} (${equipment.codigo}) teve uma anomalia reportada: ${titulo}. Severidade: ${severidade}.`,
        severidade === "alta" ? "error" : severidade === "media" ? "warning" : "info"
      );
    }

    res.status(201).json({
      success: true,
      data: anomaly,
    });
  } catch (error) {
    console.error("[createAnomaly]", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const getAllAnomalies = async (req, res) => {
  try {
    const { estado, severidade, equipmentId, userId } = req.query;

    const where = {};

    if (estado) where.estado = estado;
    if (severidade) where.severidade = severidade;
    if (equipmentId) where.equipmentId = Number(equipmentId);
    if (userId) where.userId = Number(userId);

    const anomalies = await prisma.anomaly.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        equipment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: anomalies,
    });
  } catch (error) {
    console.error("[getAllAnomalies]", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const getAnomalyById = async (req, res) => {
  const { id } = req.params;

  try {
    const anomaly = await prisma.anomaly.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        equipment: true,
      },
    });

    if (!anomaly) {
      return res.status(404).json({
        success: false,
        error: "Anomalia não encontrada",
      });
    }

    res.json({
      success: true,
      data: anomaly,
    });
  } catch (error) {
    console.error("[getAnomalyById]", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const updateAnomaly = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, estado, severidade } = req.body;

  try {
    const anomaly = await prisma.anomaly.findUnique({
      where: { id: Number(id) },
    });

    if (!anomaly) {
      return res.status(404).json({
        success: false,
        error: "Anomalia não encontrada",
      });
    }

    const updated = await prisma.anomaly.update({
      where: { id: Number(id) },
      data: {
        titulo: titulo || anomaly.titulo,
        descricao: descricao || anomaly.descricao,
        estado: estado || anomaly.estado,
        severidade: severidade || anomaly.severidade,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        equipment: true,
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "ATUALIZAR_ANOMALIA",
        tabelaAfetada: "Anomaly",
        registroId: updated.id,
        equipmentId: updated.equipmentId,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[updateAnomaly]", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const resolveAnomaly = async (req, res) => {
  const { id } = req.params;

  try {
    const anomaly = await prisma.anomaly.findUnique({
      where: { id: Number(id) },
    });

    if (!anomaly) {
      return res.status(404).json({
        success: false,
        error: "Anomalia não encontrada",
      });
    }

    const updated = await prisma.anomaly.update({
      where: { id: Number(id) },
      data: {
        estado: "resolvida",
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        equipment: true,
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "RESOLVER_ANOMALIA",
        tabelaAfetada: "Anomaly",
        registroId: updated.id,
        equipmentId: updated.equipmentId,
      },
    });

    // Notificar quem reportou a anomalia
    await createNotification(
      anomaly.userId,
      "Anomalia Resolvida",
      `A anomalia "${anomaly.titulo}" no equipamento ${updated.equipment.nome} foi resolvida.`,
      "success"
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[resolveAnomaly]", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const deleteAnomaly = async (req, res) => {
  const { id } = req.params;

  try {
    const anomaly = await prisma.anomaly.findUnique({
      where: { id: Number(id) },
    });

    if (!anomaly) {
      return res.status(404).json({
        success: false,
        error: "Anomalia não encontrada",
      });
    }

    await prisma.anomaly.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "DELETAR_ANOMALIA",
        tabelaAfetada: "Anomaly",
        registroId: Number(id),
        equipmentId: anomaly.equipmentId,
      },
    });

    res.json({
      success: true,
      message: "Anomalia eliminada com sucesso",
    });
  } catch (error) {
    console.error("[deleteAnomaly]", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

module.exports = {
  createAnomaly,
  getAllAnomalies,
  getAnomalyById,
  updateAnomaly,
  resolveAnomaly,
  deleteAnomaly,
};
