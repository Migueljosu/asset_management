const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createAnomaly,
  getAllAnomalies,
  getAnomalyById,
  updateAnomaly,
  resolveAnomaly,
  deleteAnomaly,
} = require("../controllers/anomalyController");

// qualquer utilizador autenticado pode reportar
router.post("/", auth, role("admin", "tecnico", "funcionario"), createAnomaly);

// qualquer utilizador autenticado pode consultar
router.get("/", auth, getAllAnomalies);
router.get("/:id", auth, getAnomalyById);

// admin edita/elimina, admin e tecnico resolvem
router.put("/:id", auth, role("admin"), updateAnomaly);
router.put("/:id/resolve", auth, role("admin", "tecnico"), resolveAnomaly);
router.delete("/:id", auth, role("admin"), deleteAnomaly);

module.exports = router;
