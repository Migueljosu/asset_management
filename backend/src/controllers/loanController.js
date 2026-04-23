const prisma = require("../utils/prisma");

const getAllLoans = async (req, res) => {
  try {
    const where = {};

    if (req.user.perfil === "funcionario") {
      where.userId = req.user.id;
    }

    const loans = await prisma.loan.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: loans,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

const createLoan = async (req, res) => {
  const { equipmentId, setorDestinoId, dataPrevista, scheduleId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.findUnique({
        where: { id: Number(equipmentId) },
      });

      if (!equipment) {
        throw new Error("Equipamento não encontrado");
      }

      if (equipment.estado !== "disponivel") {
        throw new Error("Equipamento indisponível");
      }

      if (scheduleId) {
        const schedule = await tx.schedule.findUnique({
          where: { id: Number(scheduleId) },
        });

        if (!schedule || schedule.estado !== "aprovado") {
          throw new Error("Schedule inválido");
        }
      }

      const loan = await tx.loan.create({
        data: {
          userId: req.user.id,
          equipmentId: Number(equipmentId),
          setorDestinoId: Number(setorDestinoId),
          dataSaida: new Date(),
          dataPrevista: new Date(dataPrevista),
          estado: "ativo",
          scheduleId: scheduleId ? Number(scheduleId) : null,
        },
        include: {
          user: true,
          equipment: true,
          setorDestino: true,
        },
      });

      await tx.equipment.update({
        where: { id: Number(equipmentId) },
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

    res.status(201).json({
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
    await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: Number(loanId) },
      });

      if (!loan || loan.estado !== "ativo") {
        throw new Error("Empréstimo inválido");
      }

      await tx.loan.update({
        where: { id: Number(loanId) },
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

const deleteLoan = async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await prisma.loan.findUnique({
      where: { id: Number(id) },
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: "Empréstimo não encontrado",
      });
    }

    if (loan.estado === "ativo") {
      return res.status(400).json({
        success: false,
        error: "Não pode eliminar empréstimo ativo",
      });
    }

    await prisma.loan.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        userId: req.user.id,
        acao: "DELETAR_EMPRESTIMO",
        tabelaAfetada: "Loan",
        registroId: Number(id),
      },
    });

    res.json({
      success: true,
      message: "Empréstimo eliminado com sucesso",
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
};

module.exports = { getAllLoans, createLoan, returnLoan, deleteLoan };
