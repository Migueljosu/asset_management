import { useState } from 'react'
import { Anomaly } from '../anomalies/types'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'
import { AlertTriangle, ShieldAlert, Shield, CheckCircle2, Clock } from 'lucide-react'

interface Props {
  data: Anomaly[]
}

export default function AnomaliesTable({ data }: Props) {
  const [search, setSearch] = useState('')

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<Anomaly>({
    data,
    itemsPerPage: 5,
    searchFields: ['title', 'equipmentName', 'description'],
    searchValue: search,
  })

  const severityConfig: Record<string, { label: string; color: string; icon: any }> = {
    low: { label: 'Baixa', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Shield },
    medium: { label: 'Média', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: ShieldAlert },
    high: { label: 'Alta', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    reported: { label: 'Reportada', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock },
    in_progress: { label: 'Em análise', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ShieldAlert },
    resolved: { label: 'Resolvida', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  }

  if (data.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm text-center">
        <p className="text-muted-foreground py-8">Nenhuma anomalia registrada ainda</p>
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h3 className="font-semibold text-lg">Detalhes das Anomalias</h3>
        <span className="text-sm text-muted-foreground">{totalItems} anomalia(s)</span>
      </div>

      <input
        type="text"
        placeholder="Pesquisar por título, equipamento ou descrição..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-semibold text-muted-foreground">Título</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Equipamento</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Severidade</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Data</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((a) => {
              const sev = severityConfig[a.severity] || severityConfig.low
              const stat = statusConfig[a.status] || statusConfig.reported
              const SevIcon = sev.icon
              const StatIcon = stat.icon

              return (
                <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.equipmentName || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${sev.color}`}>
                      <SevIcon size={12} />
                      {sev.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${stat.color}`}>
                      <StatIcon size={12} />
                      {stat.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
    </div>
  )
}

