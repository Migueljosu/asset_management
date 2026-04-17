const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 tentativas
  message: {
    error: "Muitas tentativas. Tente mais tarde.",
  },
});

module.exports = { loginLimiter };