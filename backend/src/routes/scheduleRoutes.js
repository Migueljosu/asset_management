const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { createSchedule } = require("../controllers/scheduleController");

router.post("/", auth, role("admin", "funcionario"), createSchedule);

module.exports = router;