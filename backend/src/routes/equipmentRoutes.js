const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");

const {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getAllEquipments,
  getEquipmentById,
} = require("../controllers/equipmentController");

router.post("/", auth, createEquipment);
router.get("/", auth, getAllEquipments);
router.get("/:id", auth, getEquipmentById);
router.put("/:id", auth, updateEquipment);
router.delete("/:id", auth, deleteEquipment);

module.exports = router;