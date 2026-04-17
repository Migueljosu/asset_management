const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createTransfer,
  getAllTransfers,
  getTransferById,
  getTransfersByEquipment,
} = require("../controllers/transferController");

// só admin pode transferir
router.post("/", auth, role("admin"), createTransfer);

// admin pode ver tudo
router.get("/", auth, role("admin"), getAllTransfers);
router.get("/:id", auth, role("admin"), getTransferById);

// histórico
router.get("/equipment/:equipmentId", auth, role("admin"), getTransfersByEquipment);

module.exports = router;