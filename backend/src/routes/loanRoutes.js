const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { createLoan, returnLoan } = require("../controllers/loanController");

router.post("/", auth, role("admin", "funcionario"), createLoan);
router.post("/return", auth, role("admin", "funcionario"), returnLoan);

module.exports = router;