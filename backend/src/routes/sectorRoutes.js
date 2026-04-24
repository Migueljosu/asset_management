/**
 * @swagger
 * tags:
 *   - name: Sector
 */

const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createSector,
  getAllSectors,
  getSectorById,
  updateSector,
  deleteSector,
} = require("../controllers/sectorController");

router.post("/", auth, role("admin"), createSector);
router.get("/", auth, role("admin", "funcionario"), getAllSectors);
router.get("/:id", auth, role("admin", "funcionario"), getSectorById);
router.put("/:id", auth, role("admin"), updateSector);
router.delete("/:id", auth, role("admin"), deleteSector);

module.exports = router;
