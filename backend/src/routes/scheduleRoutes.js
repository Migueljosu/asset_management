const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");

const { createSchedule } = require("../controllers/scheduleController");

router.post("/", auth, createSchedule);

module.exports = router;