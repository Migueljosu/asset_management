interface Props {
  title: string
  value: number
  color: string
  bg: string
  border: string
}

export default function StatisticsCard({ title, value, color, bg, border }: Props) {
  return (
    <div className={`${bg} p-6 rounded-2xl shadow border ${border}`}>
      <p className={`${color} text-sm font-medium`}>
        {title}
      </p>
      <h2 className={`text-4xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  )
}