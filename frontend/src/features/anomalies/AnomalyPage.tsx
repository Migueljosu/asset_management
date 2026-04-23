import { useState } from 'react'
import AnomalyForm from './AnomalyForm'
import AnomalyList from './AnomalyList'
import { useAppState } from '@/context/AppContext'

export default function AnomalyPage() {
  const { theme } = useAppState()  // <-- usando AppContext
  const [refreshKey, setRefreshKey] = useState(0)
  const [showList, setShowList] = useState(true)

  function refresh() {
    setRefreshKey((prev) => prev + 1)
    setShowList(true)
  }

  return (
    <div className={`min-h-screen p-8 space-y-8 ${theme === 'dark' ? 'bg-zinc-900 text-zinc-100' : 'bg-gray-50 text-zinc-900'}`}>

      {/* Botão voltar */}
      {/*  <div>
        <BackToHome />
      </div>*/}
    
     
      {/* FORM */}
      <div className="card w-full">
        <AnomalyForm onSuccess={refresh} />
      </div>

      {/* Controle da lista */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Lista de Anomalias</h2>
        <button
          onClick={() => setShowList(!showList)}
          className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded transition"
        >
          {showList ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {/* Lista colapsável */}
      <div className={`transition-all duration-300 overflow-hidden ${showList ? 'max-h-[600px]' : 'max-h-0'}`}>
        <div className="card">
          <AnomalyList refreshKey={refreshKey} />
        </div>
      </div>

    </div>
  )
}