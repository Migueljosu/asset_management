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

// admin e técnico podem gerir manutenção
router.post("/", auth, role("admin", "tecnico"), startMaintenance);
router.put("/:id/finish", auth, role("admin", "tecnico"), finishMaintenance);
router.put("/:id/cancel", auth, role("admin", "tecnico"), cancelMaintenance);

// admin e técnico podem ver
router.get("/", auth, role("admin", "tecnico"), getAllMaintenances);
router.get("/:id", auth, role("admin", "tecnico"), getMaintenanceById);

module.exports = router;
