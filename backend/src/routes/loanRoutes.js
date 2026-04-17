const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");

const { createLoan, returnLoan } = require("../controllers/loanController");

router.post("/", auth, createLoan);
router.post("/return", auth, returnLoan);

module.exports = router;