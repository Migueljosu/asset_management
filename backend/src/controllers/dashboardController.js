const prisma = require("../utils/prisma")

const getDashboardStats = async (req, res) => {
  try {
    // 🔥 tudo em paralelo (melhor performance)
    const [
      totalEquipments,
      grouped,
      totalAnomalies,
      activeUsers,
    ] = await Promise.all([
      prisma.equipment.count(),

      prisma.equipment.groupBy({
        by: ["estado"],
        _count: true,
      }),

      prisma.maintenance.count({
        where: { estado: "em_andamento" },
      }),

      prisma.user.count(),
    ])

    // 🔥 mapear estados (garante consistência)
    const byStatus = {
      disponivel: 0,
      reservado: 0,
      em_uso: 0,
      manutencao: 0,
      inativo: 0,
    }

    grouped.forEach((item) => {
      byStatus[item.estado] = item._count
    })

    // 🔥 performance realista
    const performance = totalEquipments > 0
      ? Math.floor(
          ((byStatus.disponivel + byStatus.em_uso) / totalEquipments) * 100
        )
      : 0

    // 🔥 gráfico (placeholder inteligente)
    const monthlyData = [
      { month: "Jan", value: 30 },
      { month: "Feb", value: 45 },
      { month: "Mar", value: 60 },
      { month: "Apr", value: 40 },
      { month: "May", value: 75 },
    ]

    res.json({
      success: true,
      data: {
        totalEquipments,
        byStatus,
        totalAnomalies,
        activeUsers,
        performance,
        monthlyData,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      error: "Erro ao buscar dashboard",
    })
  }
}

module.exports = { getDashboardStats }