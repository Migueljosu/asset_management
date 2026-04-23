const prisma = require("../utils/prisma");
const { createEquipmentSchema, updateEquipmentSchema } = require("../validators/equipmentValidator");
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

// ================= CREATE =================
const createEquipment = async (req, res) => {
  try {
    const data = createEquipmentSchema.parse(req.body);
    const { nome, codigo } = data;

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

    // Notificar admin que novo equipamento foi criado
    await notifyAdmins(
      "Novo Equipamento",
      `O equipamento ${equipment.nome} (${equipment.codigo}) foi registado no sistema.`,
      "success"
    );

    res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }
    console.error("[createEquipment]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

// ================= UPDATE =================
const updateEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const data = updateEquipmentSchema.parse(req.body);

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
        nome: data.nome || equipment.nome,
        estado: data.estado || equipment.estado,
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
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.errors,
      });
    }
    console.error("[updateEquipment]", error);
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
  } catch (error) {
    console.error("[deleteEquipment]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

// ================= GET ALL =================
const getAllEquipments = async (req, res) => {
  try {
    let { page = 1, limit = 10, estado, nome } = req.query;

    page = Number(page);
    limit = Number(limit);

    const where = {};

    // filtros dinâmicos
    if (estado) {
      where.estado = estado;
    }

    if (nome) {
      where.nome = {
        contains: nome,
        mode: "insensitive",
      };
    }

    const [total, equipments] = await Promise.all([
      prisma.equipment.count({ where }),
      prisma.equipment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      success: true,
      data: equipments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getAllEquipments]", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
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
  } catch (error) {
    console.error("[getEquipmentById]", error);
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
