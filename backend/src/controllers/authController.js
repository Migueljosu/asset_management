const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { generateToken } = require("../utils/jwt");
const { registerSchema, loginSchema } = require("../validators/authValidator");

//  gerar refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const { nome, email, senha, perfil } = data;

    // ❗ bloquear criação de admin
    if (perfil === "admin") {
      return res.status(403).json({
        success: false,
        error: "Não permitido criar admin",
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
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
    });

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      data: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const { email, senha } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Credenciais inválidas",
      });
    }

    const validPassword = await bcrypt.compare(senha, user.senha);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Credenciais inválidas",
      });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      success: true,
      message: "Login realizado",
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
        },
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

// ================= REFRESH TOKEN =================
const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: "Refresh token obrigatório",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        error: "Token inválido",
      });
    }

    const newToken = generateToken(user);

    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch {
    res.status(403).json({
      success: false,
      error: "Token inválido",
    });
  }
};

// ================= REQUEST RESET =================
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        success: true,
        message: "Se existir, email enviado",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExp: new Date(Date.now() + 3600000),
      },
    });

    console.log("RESET TOKEN:", token);

    res.json({
      success: true,
      message: "Se existir, email enviado",
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  const { token, novaSenha } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Token inválido ou expirado",
      });
    }

    const hashed = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        senha: hashed,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    res.json({
      success: true,
      message: "Senha atualizada com sucesso",
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  requestPasswordReset,
  resetPassword,
};
