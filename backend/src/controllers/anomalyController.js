const prisma = require("../utils/prisma");

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

    res.status(201).json({
      success: true,
      data: anomaly,
    });
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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

    res.json({
      success: true,
      data: updated,
    });
  } catch {
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
  } catch {
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
