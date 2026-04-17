const prisma = require("../utils/prisma");

// ================= CREATE =================
const createEquipment = async (req, res) => {
  try {
    const { nome, codigo } = req.body;

    if (!nome || !codigo) {
      return res.status(400).json({
        success: false,
        error: "Nome e código são obrigatórios",
      });
    }

    const exists = await prisma.equipment.findUnique({
      where: { codigo },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        error: "Código já existe",
      });
    }

    const equipment = await prisma.equipment.create({
      data: {
        nome,
        codigo,
        estado: "disponivel",
      },
    });

    // log
    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "CRIAR_EQUIPAMENTO",
        tabelaAfetada: "Equipment",
        registroId: equipment.id,
      },
    });

    res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

// ================= UPDATE =================
const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { nome, estado } = req.body;

  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: Number(id) },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: "Equipamento não encontrado",
      });
    }

    const updated = await prisma.equipment.update({
      where: { id: Number(id) },
      data: {
        nome: nome || equipment.nome,
        estado: estado || equipment.estado,
      },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "ATUALIZAR_EQUIPAMENTO",
        tabelaAfetada: "Equipment",
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

// ================= DELETE =================
const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: Number(id) },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: "Equipamento não encontrado",
      });
    }

    // ❗ regra importante
    if (equipment.estado !== "disponivel") {
      return res.status(400).json({
        success: false,
        error: "Não pode deletar equipamento em uso",
      });
    }

    await prisma.equipment.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "DELETAR_EQUIPAMENTO",
        tabelaAfetada: "Equipment",
        registroId: Number(id),
      },
    });

    res.json({
      success: true,
      message: "Equipamento deletado",
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

// ================= GET ALL =================
const getAllEquipments = async (req, res) => {
  try {
    const equipments = await prisma.equipment.findMany({
      include: {
        logs: true, // ⚠️ precisa relação no schema
      },
    });

    res.json({
      success: true,
      data: equipments,
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

// ================= GET ONE =================
const getEquipmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: Number(id) },
      include: {
        logs: true,
      },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: "Equipamento não encontrado",
      });
    }

    res.json({
      success: true,
      data: equipment,
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

module.exports = {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getAllEquipments,
  getEquipmentById,
};