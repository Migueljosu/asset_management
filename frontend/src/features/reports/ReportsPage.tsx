import { useEffect, useState } from 'react'
import BackToHome from '@/components/ui/BackToHome'
import StatsCards from './StatsCards'
import AnomaliesTable from './AnomaliesTables'
import AnomalyChart from '../anomalies/AnomaliesChart'
import MaintenanceChart from '../manutention/MaintenanceChart'

import { reportService } from './reportService'
import { anomalyService } from '../anomalies/anomalyService'

import { SystemStats, SeverityStats, StatusStats } from './types'
import { Anomaly } from '../anomalies/types'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function ReportsPage() {

  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [severityStats, setSeverityStats] = useState<SeverityStats | null>(null)
  const [statusStats, setStatusStats] = useState<StatusStats | null>(null)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [system, severity, status, anomaliesData] = await Promise.all([
      reportService.getSystemStats(),
      reportService.getSeverityStats(),
      reportService.getStatusStats(),
      anomalyService.getAll()
    ])

    setSystemStats(system)
    setSeverityStats(severity)
    setStatusStats(status)
    setAnomalies(anomaliesData)
  }

  async function exportPDF() {
    const element = document.getElementById('report-area')
    if (!element) return

    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF()
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
    pdf.save('relatorio.pdf')
  }

  if (!systemStats || !severityStats || !statusStats) {
    return <p>Carregando relatórios...</p>
  }

  return (
    <div className="space-y-6">

    

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Relatórios e Estatísticas
        </h1>

        <button
          onClick={exportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          Exportar PDF
        </button>
      </div>

      <div id="report-area" className="space-y-10">

        <StatsCards stats={systemStats} />

        <div className="grid grid-cols-2 gap-6">
          <AnomalyChart data={severityStats} />
          <MaintenanceChart data={statusStats} />
        </div>

        <AnomaliesTable data={anomalies} />

      </div>

    </div>
  )
}