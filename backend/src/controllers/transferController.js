const prisma = require("../utils/prisma");

const transferEquipment = async (req, res) => {
  const { equipmentId, setorOrigemId, setorDestinoId } = req.body;

  const transfer = await prisma.transfer.create({
    data: {
      equipmentId,
      setorOrigemId,
      setorDestinoId,
    },
  });

  res.json(transfer);
};

module.exports = { transferEquipment };