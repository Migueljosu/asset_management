const prisma = require("../utils/prisma");

const createLoan = async (req, res) => {
  const { equipmentId, setorDestinoId, dataPrevista, scheduleId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!equipment) {
        throw new Error("Equipamento não encontrado");
      }

      if (equipment.estado !== "disponivel") {
        throw new Error("Equipamento indisponível");
      }

      // se vier de schedule → validar
      if (scheduleId) {
        const schedule = await tx.schedule.findUnique({
          where: { id: scheduleId },
        });

        if (!schedule || schedule.estado !== "aprovado") {
          throw new Error("Schedule inválido");
        }
      }

      const loan = await tx.loan.create({
        data: {
          userId: req.user.id,
          equipmentId,
          setorDestinoId,
          dataSaida: new Date(),
          dataPrevista: new Date(dataPrevista),
          estado: "ativo",
          scheduleId: scheduleId || null,
        },
      });

      // atualizar estado equipamento
      await tx.equipment.update({
        where: { id: equipmentId },
        data: { estado: "em_uso" },
      });

      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "CRIAR_EMPRESTIMO",
          tabelaAfetada: "Loan",
          registroId: loan.id,
        },
      });
      return loan;
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const returnLoan = async (req, res) => {
  const { loanId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
      });

      if (!loan || loan.estado !== "ativo") {
        throw new Error("Empréstimo inválido");
      }

      await tx.loan.update({
        where: { id: loanId },
        data: {
          estado: "devolvido",
          dataDevolucao: new Date(),
        },
      });
      
      await tx.log.create({
        data: {
          userId: req.user.id,
          acao: "DEVOLVER_EQUIPAMENTO",
          tabelaAfetada: "Loan",
          registroId: loan.id,
        },
      });

      await tx.equipment.update({
        where: { id: loan.equipmentId },
        data: { estado: "disponivel" },
      });

      return true;
    });

    res.json({
      success: true,
      message: "Devolvido com sucesso",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { createLoan, returnLoan };
