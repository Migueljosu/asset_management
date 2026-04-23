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

// usar rotas
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/equipment", equipmentRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/loans", loanRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/transfers", transferRoutes);
router.use("/dashboard", dashboardRoutes)

module.exports = router;