const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createSchedule,
  getAllSchedules,
  approveSchedule,
  cancelSchedule,
  completeSchedule,
} = require("../controllers/scheduleController");

router.get("/", auth, role("admin", "funcionario"), getAllSchedules);
router.post("/", auth, role("admin", "funcionario"), createSchedule);
router.put("/:id/approve", auth, role("admin"), approveSchedule);
router.put("/:id/cancel", auth, role("admin", "funcionario"), cancelSchedule);
router.put("/:id/complete", auth, role("admin"), completeSchedule);

module.exports = router;
