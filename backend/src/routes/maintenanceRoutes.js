const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  startMaintenance,
  finishMaintenance,
  getAllMaintenances,
  getMaintenanceById,
  cancelMaintenance,
} = require("../controllers/maintenanceController");

// 🔧 técnico
router.post("/", auth, role("tecnico"), startMaintenance);
router.put("/:id/finish", auth, role("tecnico"), finishMaintenance);
router.put("/:id/cancel", auth, role("tecnico"), cancelMaintenance);

// admin e técnico podem ver
router.get("/", auth, role("admin", "tecnico"), getAllMaintenances);
router.get("/:id", auth, role("admin", "tecnico"), getMaintenanceById);

module.exports = router;