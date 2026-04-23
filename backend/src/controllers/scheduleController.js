const prisma = require("../utils/prisma");
const { createLog } = require("../utils/logger");
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

const hasConflict = async ({ equipmentId, dataInicio, dataFim, excludeId, tx = prisma }) => {
  return tx.schedule.findFirst({
    where: {
      equipmentId,
      estado: { in: ["pendente", "aprovado"] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      AND: [
        { dataInicio: { lt: new Date(dataFim) } },
        { dataFim: { gt: new Date(dataInicio) } },
      ],
    },
  });
};

const createSchedule = async (req, res) => {
  try {
    const { equipmentId, setorDestinoId, dataInicio, dataFim } = req.body;

    if (!equipmentId || !setorDestinoId || !dataInicio || !dataFim) {
      return res.status(400).json({
        success: false,
        error: "equipmentId, setorDestinoId, dataInicio e dataFim são obrigatórios",
      });
    }

    if (new Date(dataFim) <= new Date(dataInicio)) {
      return res.status(400).json({
        success: false,
        error: "Datas inválidas",
      });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: Number(equipmentId) },
    });

    if (!equipment || equipment.estado !== "disponivel") {
      return res.status(400).json({
        success: false,
        error: "Equipamento indisponível",
      });
    }

    const conflito = await hasConflict({
      equipmentId: Number(equipmentId),
      dataInicio,
      dataFim,
    });

    if (conflito) {
      return res.status(400).json({
        success: false,
        error: "Equipamento já agendado nesse período",
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId: req.user.id,
        equipmentId: Number(equipmentId),
        setorDestinoId: Number(setorDestinoId),
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        estado: "pendente",
      },
      include: {
        user: true,
        equipment: true,
        setorDestino: true,
      },
    });

    await createLog({
      userId: req.user.id,
      acao: "CRIAR_AGENDAMENTO",
      tabelaAfetada: "Schedule",
      registroId: schedule.id,
    });

    // Notificar admins que novo agendamento foi criado
    await notifyAdmins(
      "Novo Agendamento",
      `${schedule.user.nome} agendou o equipamento ${schedule.equipment.nome} (${schedule.equipment.codigo}) para o setor ${schedule.setorDestino.nome}. Período: ${new Date(dataInicio).toLocaleDateString('pt-PT')} a ${new Date(dataFim).toLocaleDateString('pt-PT')}.`,
      "info"
    );

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("[createSchedule]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const getAllSchedules = async (req, res) => {
  try {
    const where = {};

    if (req.user.perfil === "funcionario") {
      where.userId = req.user.id;
    }

    const schedules = await prisma.schedule.findMany({
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
        setorDestino: true,
      },
      orderBy: { dataInicio: "asc" },
    });

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("[getAllSchedules]", error);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

const approveSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.findUnique({
        where: { id: Number(id) },
      });

      if (!schedule || schedule.estado !== "pendente") {
        throw new Error("Agendamento inválido");
      }

      const equipment = await tx.equipment.findUnique({
        where: { id: schedule.equipmentId },
      });

      if (!equipment || equipment.estado !== "disponivel") {
        throw new Error("Equipamento indisponível");
      }

      const conflito = await hasConflict({
        equipmentId: schedule.equipmentId,
        dataInicio: schedule.dataInicio,
        dataFim: schedule.dataFim,
        excludeId: schedule.id,
        tx,
      });

      if (conflito) {
        throw new Error("Existe conflito com outro agendamento");
      }

      const updated = await tx.schedule.update({
        where: { id: Number(id) },
        data: { estado: "aprovado" },
        include: {
          user: true,
          equipment: true,
          setorDestino: true,
        },
      });

      await tx.loan.create({
        data: {
          userId: schedule.userId,
          equipmentId: schedule.equipmentId,
          setorDestinoId: schedule.setorDestinoId,
          dataSaida: new Date(),
          dataPrevista: new Date(schedule.dataFim),
          estado: "ativo",
          scheduleId: schedule.id,
        },
      });

      await tx.equipment.update({
        where: { id: schedule.equipmentId },
        data: { estado: "em_uso" },
      });

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "APROVAR_AGENDAMENTO",
          tabelaAfetada: "Schedule",
          registroId: updated.id,
        },
      });

      return updated;
    });

    // Notificar o funcionário que criou o agendamento
    await createNotification(
      result.userId,
      "Agendamento Aprovado",
      `O seu agendamento para o equipamento ${result.equipment.nome} foi aprovado. Período: ${new Date(result.dataInicio).toLocaleDateString('pt-PT')} a ${new Date(result.dataFim).toLocaleDateString('pt-PT')}.`,
      "success"
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[approveSchedule]", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const cancelSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.findUnique({
        where: { id: Number(id) },
      });

      if (!schedule) {
        throw new Error("Agendamento não encontrado");
      }

      const isOwner = schedule.userId === req.user.id;
      const isAdmin = req.user.perfil === "admin";

      if (!isOwner && !isAdmin) {
        throw new Error("Sem permissão");
      }

      if (["cancelado", "concluido"].includes(schedule.estado)) {
        throw new Error("Agendamento não pode ser cancelado");
      }

      const updated = await tx.schedule.update({
        where: { id: Number(id) },
        data: { estado: "cancelado" },
        include: {
          user: true,
          equipment: true,
          setorDestino: true,
        },
      });

      if (schedule.estado === "aprovado") {
        await tx.loan.deleteMany({
          where: { scheduleId: schedule.id },
        });

        await tx.equipment.update({
          where: { id: schedule.equipmentId },
          data: { estado: "disponivel" },
        });
      }

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "CANCELAR_AGENDAMENTO",
          tabelaAfetada: "Schedule",
          registroId: updated.id,
        },
      });

      return updated;
    });

    // Notificar o funcionário que o agendamento foi cancelado
    await createNotification(
      result.userId,
      "Agendamento Cancelado",
      `O seu agendamento para o equipamento ${result.equipment.nome} foi cancelado.`,
      "warning"
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[cancelSchedule]", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const completeSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.findUnique({
        where: { id: Number(id) },
      });

      if (!schedule || schedule.estado !== "aprovado") {
        throw new Error("Agendamento inválido");
      }

      if (new Date() < new Date(schedule.dataFim)) {
        throw new Error("Só pode concluir após a data de fim");
      }

      const updated = await tx.schedule.update({
        where: { id: Number(id) },
        data: { estado: "concluido" },
        include: {
          user: true,
          equipment: true,
          setorDestino: true,
        },
      });

      await tx.loan.updateMany({
        where: {
          scheduleId: schedule.id,
          estado: "ativo",
        },
        data: {
          estado: "devolvido",
          dataDevolucao: new Date(),
        },
      });

      await tx.equipment.update({
        where: { id: schedule.equipmentId },
        data: { estado: "disponivel" },
      });

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "CONCLUIR_AGENDAMENTO",
          tabelaAfetada: "Schedule",
          registroId: updated.id,
        },
      });

      return updated;
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[completeSchedule]", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createSchedule,
  getAllSchedules,
  approveSchedule,
  cancelSchedule,
  completeSchedule,
};
