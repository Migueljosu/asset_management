const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.perfil)) {
      return res.status(403).json({ error: "Sem permissão" });
    }
    next();
  };
};

module.exports = roleMiddleware;