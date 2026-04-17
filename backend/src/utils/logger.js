const prisma = require("./prisma");

const createLog = async ({ userId, acao, tabelaAfetada, registroId }) => {
  try {
    await prisma.log.create({
      data: {
        userId,
        acao,
        tabelaAfetada,
        registroId,
      },
    });
  } catch (error) {
    console.error("Erro ao criar log:", error.message);
  }
};

module.exports = { createLog };