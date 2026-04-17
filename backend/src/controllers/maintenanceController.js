const prisma = require("../utils/prisma");

const startMaintenance = async (req, res) => {
  const { equipmentId, tipo, descricao } = req.body;

  const maintenance = await prisma.maintenance.create({
    data: {
      equipmentId,
      tecnicoId: req.user.id,
      tipo,
      descricao,
      dataInicio: new Date(),
      estado: "em_andamento",
    },
  });

  await prisma.equipment.update({
    where: { id: equipmentId },
    data: { estado: "manutencao" },
  });
  await tx.log.create({
    data: {
      userId: req.user.id,
      acao: "INICIAR_MANUTENCAO",
      tabelaAfetada: "Maintenance",
      registroId: maintenance.id,
    },
  });
  res.json(maintenance);
};

module.exports = { startMaintenance };
