const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      perfil: user.perfil,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

module.exports = { generateToken };