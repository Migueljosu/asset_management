const prisma = require("../utils/prisma");

const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, perfil, nome } = req.query;

    page = Number(page);
    limit = Number(limit);

    const where = {};

    if (perfil) where.perfil = perfil;

    if (nome) {
      where.nome = {
        contains: nome,
        mode: "insensitive",
      };
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nome, perfil } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }

    // ❗ não permitir alterar admin por segurança
    if (user.perfil === "admin" && req.user.perfil !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Sem permissão para alterar admin",
      });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        nome: nome || user.nome,
        perfil: perfil || user.perfil,
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "ATUALIZAR_USUARIO",
        tabelaAfetada: "User",
        registroId: updated.id,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }

    // ❗ não deletar a si mesmo
    if (req.user.id === user.id) {
      return res.status(400).json({
        success: false,
        error: "Não pode deletar sua própria conta",
      });
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "DELETAR_USUARIO",
        tabelaAfetada: "User",
        registroId: Number(id),
      },
    });

    res.json({
      success: true,
      message: "Usuário deletado",
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
      },
    });

    // 🔥 EVITA CACHE (ESSENCIAL)
    res.set("Cache-Control", "no-store");

    res.json({
      success: true,
      data: user,
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
};
