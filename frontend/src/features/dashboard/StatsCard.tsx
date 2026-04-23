// features/dashboard/StateCard.tsx
import React from 'react'

interface StateCardProps {
  title: string
  description: string
  icon: React.ReactNode
  extra?: React.ReactNode
  onClick?: () => void
}

export default function StateCard({ title, description, icon, extra, onClick }: StateCardProps) {
  return (
    <div
      className="p-6 rounded-lg border border-border
      bg-card text-card-foreground shadow-sm hover:shadow-md transition-all
      cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div
          className="flex-shrink-0 p-2 rounded-lg bg-accent text-accent-foreground
        group-hover:bg-accent/80 transition-colors"
        >
          {icon}
        </div>

        <div className="w-full">
          <h2 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
            {title}
          </h2>

          <p className="text-muted-foreground">{description}</p>

          {/* 🔥 EXTRA INFO */}
          {extra && <div className="text-xs text-gray-400 mt-2">{extra}</div>}
        </div>
      </div>
    </div>
  )
}
