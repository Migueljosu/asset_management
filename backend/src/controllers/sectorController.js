const prisma = require("../utils/prisma");

const createSector = async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        error: "Nome é obrigatório",
      });
    }

    const sector = await prisma.sector.create({
      data: {
        nome: nome.trim(),
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "CRIAR_SETOR",
        tabelaAfetada: "Sector",
        registroId: sector.id,
      },
    });

    res.status(201).json({
      success: true,
      data: sector,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const getAllSectors = async (req, res) => {
  try {
    const sectors = await prisma.sector.findMany({
      orderBy: { nome: "asc" },
    });

    res.json({
      success: true,
      data: sectors,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const getSectorById = async (req, res) => {
  const { id } = req.params;

  try {
    const sector = await prisma.sector.findUnique({
      where: { id: Number(id) },
    });

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: "Setor não encontrado",
      });
    }

    res.json({
      success: true,
      data: sector,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const updateSector = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  try {
    const sector = await prisma.sector.findUnique({
      where: { id: Number(id) },
    });

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: "Setor não encontrado",
      });
    }

    const updated = await prisma.sector.update({
      where: { id: Number(id) },
      data: {
        nome: nome?.trim() || sector.nome,
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "ATUALIZAR_SETOR",
        tabelaAfetada: "Sector",
        registroId: updated.id,
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

const deleteSector = async (req, res) => {
  const { id } = req.params;

  try {
    const sector = await prisma.sector.findUnique({
      where: { id: Number(id) },
    });

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: "Setor não encontrado",
      });
    }

    await prisma.sector.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "DELETAR_SETOR",
        tabelaAfetada: "Sector",
        registroId: Number(id),
      },
    });

    res.json({
      success: true,
      message: "Setor eliminado com sucesso",
    });
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Não pode eliminar setor em uso",
      });
    }

    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

module.exports = {
  createSector,
  getAllSectors,
  getSectorById,
  updateSector,
  deleteSector,
};
