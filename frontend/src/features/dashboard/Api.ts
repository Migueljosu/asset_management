export async function fetchDashboardStats(token: string) {
  const res = await fetch("http://localhost:3000/api/dashboard/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.error)

  return data.data
}