import { Anomaly } from './types'

export default function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  return (
    <div className="p-5 rounded-lg border border-border bg-card shadow-sm">
      <h3 className="font-semibold">{anomaly.title}</h3>
      <p className="text-sm text-muted-foreground">{anomaly.description}</p>

      <div className="mt-3 text-xs text-muted-foreground">
        Severidade: {anomaly.severity}
      </div>
    </div>
  )
}