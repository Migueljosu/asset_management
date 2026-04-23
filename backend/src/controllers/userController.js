const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");
const { createUserSchema, updateUserSchema, changePasswordSchema, updateProfileSchema } = require("../validators/userValidator");
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

const createUser = async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body);
    const { nome, email, senha, perfil } = data;

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        error: "Email já registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        perfil,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true,
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "CRIAR_USUARIO",
        tabelaAfetada: "User",
        registroId: user.id,
      },
    });

    // Notificar admin que novo utilizador foi criado
    await notifyAdmins(
      "Novo Utilizador",
      `O utilizador ${user.nome} (${user.email}) com perfil ${user.perfil} foi criado.`,
      "success"
    );

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }
    console.error("[createUser]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

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
  } catch (error) {
    console.error("[getAllUsers]", error);
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
  } catch (error) {
    console.error("[getUserById]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const data = updateUserSchema.parse(req.body);
    const { nome, email, perfil, senha } = data;

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

    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: "Email já registrado",
        });
      }
    }

    const dataToUpdate = {
      nome: nome || user.nome,
      email: email || user.email,
      perfil: perfil || user.perfil,
    };

    if (senha) {
      dataToUpdate.senha = await bcrypt.hash(senha, 10);
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
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
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }
    console.error("[updateUser]", error);
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

    // Notificar admin que utilizador foi eliminado
    await notifyAdmins(
      "Utilizador Eliminado",
      `O utilizador ${user.nome} (${user.email}) foi eliminado do sistema.`,
      "warning"
    );

    res.json({
      success: true,
      message: "Usuário deletado",
    });
  } catch (error) {
    console.error("[deleteUser]", error);
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
  } catch (error) {
    console.error("[getProfile]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const changePassword = async (req, res) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    const { senhaAtual, novaSenha } = data;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }

    const validPassword = await bcrypt.compare(senhaAtual, user.senha);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Senha atual incorreta",
      });
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { senha: hashedPassword },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "ALTERAR_SENHA",
        tabelaAfetada: "User",
        registroId: user.id,
      },
    });

    res.json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }
    console.error("[changePassword]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const { nome, email } = data;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }

    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: "Email já registrado",
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        nome: nome || user.nome,
        email: email || user.email,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "ATUALIZAR_PERFIL",
        tabelaAfetada: "User",
        registroId: updated.id,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }
    console.error("[updateProfile]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  changePassword,
  updateProfile,
};
