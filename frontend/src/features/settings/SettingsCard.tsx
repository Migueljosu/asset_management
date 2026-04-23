interface SettingsCardProps {
  title: string
  children: React.ReactNode
}

export function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <div className="bg-card dark:bg-gray-800 p-6 rounded-2xl border border-border shadow space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      {children}
    </div>
  )
}