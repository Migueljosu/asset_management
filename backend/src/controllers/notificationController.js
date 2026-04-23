const prisma = require("../utils/prisma");

// ================= CREATE NOTIFICATION =================
const createNotification = async (userId, titulo, mensagem, tipo = "info") => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        titulo,
        mensagem,
        tipo,
      },
    });
    return notification;
  } catch (error) {
    console.error("[createNotification]", error);
    return null;
  }
};

// ================= GET ALL (DO USUÁRIO LOGADO) =================
const getMyNotifications = async (req, res) => {
  try {
    let { page = 1, limit = 20, apenasNaoLidas = false } = req.query;

    page = Number(page);
    limit = Number(limit);

    const where = {
      userId: req.user.id,
    };

    if (apenasNaoLidas === "true" || apenasNaoLidas === true) {
      where.lida = false;
    }

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Contar não lidas
    const naoLidas = await prisma.notification.count({
      where: {
        userId: req.user.id,
        lida: false,
      },
    });

    res.json({
      success: true,
      data: notifications,
      naoLidas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getMyNotifications]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

// ================= MARCAR COMO LIDA =================
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notificação não encontrada",
      });
    }

    // Só pode marcar como lida se for do próprio usuário
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Sem permissão",
      });
    }

    const updated = await prisma.notification.update({
      where: { id: Number(id) },
      data: { lida: true },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[markAsRead]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

// ================= MARCAR TODAS COMO LIDAS =================
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        lida: false,
      },
      data: { lida: true },
    });

    res.json({
      success: true,
      message: "Todas as notificações marcadas como lidas",
    });
  } catch (error) {
    console.error("[markAllAsRead]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

// ================= DELETE NOTIFICATION =================
const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notificação não encontrada",
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Sem permissão",
      });
    }

    await prisma.notification.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "Notificação deletada",
    });
  } catch (error) {
    console.error("[deleteNotification]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

