import { Anomaly } from '../anomalies/types'

interface Props {
  data: Anomaly[]
}

export default function AnomaliesTable({ data }: Props) {

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <p>Nenhuma anomalia registrada ainda</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">

      <h3 className="font-semibold mb-4">
        Detalhes das Anomalias
      </h3>

      <table className="w-full text-sm">

        <thead>
          <tr className="text-left border-b">
            <th>Título</th>
            <th>Severidade</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {data.map(a => (
            <tr key={a.id} className="border-b hover:bg-gray-50">
              <td>{a.title}</td>
              <td>{a.severity}</td>
              <td>{a.status}</td>
              <td>{new Date(a.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  )
}