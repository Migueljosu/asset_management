const prisma = require("../utils/prisma");
const { createLog } = require("../utils/logger");

const createSchedule = async (req, res) => {
  try {
    const { equipmentId, setorDestinoId, dataInicio, dataFim } = req.body;

    if (new Date(dataFim) <= new Date(dataInicio)) {
      return res.status(400).json({
        success: false,
        error: "Datas inválidas",
      });
    }

    // verificar conflitos (schedule + loan ativo)
    const conflito = await prisma.schedule.findFirst({
      where: {
        equipmentId,
        estado: { in: ["pendente", "aprovado"] },
        AND: [
          { dataInicio: { lt: new Date(dataFim) } },
          { dataFim: { gt: new Date(dataInicio) } },
        ],
      },
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
        equipmentId,
        setorDestinoId,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        estado: "pendente",
      },
    });
    
    await createLog({
      userId: req.user.id,
      acao: "CRIAR_AGENDAMENTO",
      tabelaAfetada: "Schedule",
      registroId: schedule.id,
    });

    res.json({
      success: true,
      data: schedule,
    });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
};

module.exports = { createSchedule };
