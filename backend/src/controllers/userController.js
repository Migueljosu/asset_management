const prisma = require("../utils/prisma");

const getUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

module.exports = { getUsers };