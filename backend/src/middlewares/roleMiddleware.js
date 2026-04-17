const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.perfil)) {
      return res.status(403).json({
        success: false,
        error: "Sem permissão",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
