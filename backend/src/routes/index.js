const express = require("express");
const router = express.Router();

// importar rotas
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const equipmentRoutes = require("./equipmentRoutes");
const scheduleRoutes = require("./scheduleRoutes");
const loanRoutes = require("./loanRoutes");
const maintenanceRoutes = require("./maintenanceRoutes");
const transferRoutes = require("./transferRoutes");
const dashboardRoutes = require("./dashboardRoutes")
const anomalyRoutes = require("./anomalyRoutes");
const sectorRoutes = require("./sectorRoutes");
const notificationRoutes = require("./notificationRoutes");

// usar rotas
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/equipment", equipmentRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/loans", loanRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/transfers", transferRoutes);
router.use("/dashboard", dashboardRoutes)
router.use("/anomalies", anomalyRoutes);
router.use("/sectors", sectorRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
