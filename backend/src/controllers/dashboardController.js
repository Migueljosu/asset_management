const prisma = require("../utils/prisma")

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date()
    const monthWindows = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
      return {
        start: date,
        end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
        label: date.toLocaleString("en-US", { month: "short" }),
      }
    })

    const positiveActions = [
      "CRIAR_AGENDAMENTO",
      "APROVAR_AGENDAMENTO",
      "CONCLUIR_AGENDAMENTO",
      "CRIAR_EMPRESTIMO",
      "DEVOLVER_EQUIPAMENTO",
      "INICIAR_MANUTENCAO",
      "FINALIZAR_MANUTENCAO",
      "TRANSFERENCIA_EQUIPAMENTO",
      "CRIAR_EQUIPAMENTO",
      "ATUALIZAR_EQUIPAMENTO",
    ]

    // 🔥 tudo em paralelo (melhor performance)
    const [
      totalEquipments,
      grouped,
      totalAnomalies,
      activeUsers,
      monthlyLogs,
    ] = await Promise.all([
      prisma.equipment.count(),

      prisma.equipment.groupBy({
        by: ["estado"],
        _count: true,
      }),

      prisma.anomaly.count({
        where: { estado: { not: "resolvida" } },
      }),

      prisma.user.count(),

      prisma.log.findMany({
        where: {
          data: {
            gte: monthWindows[0].start,
            lt: monthWindows[monthWindows.length - 1].end,
          },
        },
        select: {
          acao: true,
          data: true,
        },
      }),
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

    // 🔥 gráfico mensal dinâmico a partir dos logs do sistema
    const monthlyData = monthWindows.map(({ start, end, label }) => {
      const monthEntries = monthlyLogs.filter(
        (log) => log.data >= start && log.data < end
      )

      const positiveCount = monthEntries.filter((log) =>
        positiveActions.includes(log.acao)
      ).length

      const value =
        monthEntries.length > 0
          ? Math.round((positiveCount / monthEntries.length) * 100)
          : 0

      return {
        month: label,
        value,
      }
    })

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
