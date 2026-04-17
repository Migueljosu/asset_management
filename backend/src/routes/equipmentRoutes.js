const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getAllEquipments,
  getEquipmentById,
} = require("../controllers/equipmentController");

// só admin
router.post("/", auth, role("admin"), createEquipment);
router.put("/:id", auth, role("admin"), updateEquipment);
router.delete("/:id", auth, role("admin"), deleteEquipment);

// todos autenticados
router.get("/", auth, getAllEquipments);
router.get("/:id", auth, getEquipmentById);

module.exports = router;
