const express = require("express");
const router = express.Router();

const { loginLimiter } = require("../middlewares/rateLimit");

const {
  register,
  login,
  refresh,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

//  AUTH
router.post("/register", register);
router.post("/login", loginLimiter, login);

//  TOKENS
router.post("/refresh", refresh);

//  RESET PASSWORD
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;