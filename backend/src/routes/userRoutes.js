const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
} = require("../controllers/userController");

// perfil
router.get("/me", auth, getProfile);

// admin
router.get("/", auth, role("admin"), getAllUsers);
router.get("/:id", auth, role("admin"), getUserById);
router.put("/:id", auth, role("admin"), updateUser);
router.delete("/:id", auth, role("admin"), deleteUser);

module.exports = router;