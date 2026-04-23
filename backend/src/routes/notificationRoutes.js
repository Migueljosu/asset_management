const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", auth, getMyNotifications);
router.put("/read-all", auth, markAllAsRead);
router.put("/:id/read", auth, markAsRead);
router.delete("/:id", auth, deleteNotification);

module.exports = router;

