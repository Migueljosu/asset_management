import { useState } from 'react'
import AnomalyForm from './AnomalyForm'
import AnomalyList from './AnomalyList'
import { useAppState } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { anomalyService } from './anomalyService'
import { Anomaly, CreateAnomalyDTO } from './types'
import { toast } from 'sonner'

export default function AnomalyPage() {
  const { theme } = useAppState()
  const { token, user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [showList, setShowList] = useState(true)
  const [editingAnomaly, setEditingAnomaly] = useState<Anomaly | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function refresh() {
    setRefreshKey((prev) => prev + 1)
    setShowList(true)
  }

  async function handleCreate(data: CreateAnomalyDTO) {
    if (!token) return

    setSubmitting(true)
    try {
      await anomalyService.create(data, token)
      toast.success('Anomalia registrada com sucesso')
      refresh()
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível registrar a anomalia')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(data: CreateAnomalyDTO) {
    if (!token || !editingAnomaly) return

    setSubmitting(true)
    try {
      await anomalyService.update(
        editingAnomaly.id,
        {
          title: data.title,
          description: data.description,
          severity: data.severity,
        },
        token
      )
      toast.success('Anomalia atualizada com sucesso')
      setEditingAnomaly(null)
      refresh()
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível atualizar a anomalia')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!token) return

    try {
      await anomalyService.delete(id, token)
      toast.success('Anomalia eliminada com sucesso')
      refresh()
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível eliminar a anomalia')
    }
  }

  async function handleResolve(id: number) {
    if (!token) return

    try {
      await anomalyService.markAsResolved(id, token)
      toast.success('Anomalia resolvida com sucesso')
      refresh()
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível resolver a anomalia')
    }
  }

  const canEditOrDelete = user?.role === 'admin'
  const canResolve = user?.role === 'admin' || user?.role === 'tecnico'

  return (
    <div className={`min-h-screen p-8 space-y-8 ${theme === 'dark' ? 'bg-zinc-900 text-zinc-100' : 'bg-gray-50 text-zinc-900'}`}>
      <div className="card w-full">
        <AnomalyForm
          onSubmit={editingAnomaly ? handleUpdate : handleCreate}
          onSuccess={() => undefined}
          initialData={editingAnomaly}
          onCancelEdit={() => setEditingAnomaly(null)}
          loading={submitting}
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Lista de Anomalias</h2>
        <button
          onClick={() => setShowList(!showList)}
          className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded transition"
        >
          {showList ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      <div className={`transition-all duration-300 overflow-hidden ${showList ? 'max-h-[600px]' : 'max-h-0'}`}>
        <div className="card">
          <AnomalyList
            refreshKey={refreshKey}
            onEdit={canEditOrDelete ? setEditingAnomaly : undefined}
            onDelete={canEditOrDelete ? handleDelete : undefined}
            onResolve={canResolve ? handleResolve : undefined}
          />
        </div>
      </div>
    </div>
  )
}
