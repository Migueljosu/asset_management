import { Anomaly, CreateAnomalyDTO } from './types'

let mockAnomalies: Anomaly[] = []

export const anomalyService = {
  // Retorna todas as anomalias
  async getAll(): Promise<Anomaly[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockAnomalies), 300)
    )
  },

  // Cria uma nova anomalia
  async create(data: CreateAnomalyDTO): Promise<Anomaly> {
    const newAnomaly: Anomaly = {
      id: crypto.randomUUID(),
      ...data,
      status: 'reported',
      createdAt: new Date().toISOString(),
    }

    mockAnomalies.push(newAnomaly)

    return newAnomaly
  },

  // Atualiza o status de uma anomalia
  async updateStatus(id: string, status: Anomaly['status']): Promise<Anomaly | undefined> {
    const anomaly = mockAnomalies.find((a) => a.id === id)
    if (!anomaly) return undefined

    anomaly.status = status

    if (status === 'resolved') {
      anomaly.resolvedAt = new Date().toISOString()
    }

    return anomaly
  },

  // Marca uma anomalia como resolvida
  async markAsResolved(id: string): Promise<Anomaly | undefined> {
    return this.updateStatus(id, 'resolved')
  },

  // Opcional: deletar uma anomalia
  async delete(id: string): Promise<void> {
    mockAnomalies = mockAnomalies.filter((a) => a.id !== id)
  },

  // Opcional: buscar por ID
  async getById(id: string): Promise<Anomaly | undefined> {
    return mockAnomalies.find((a) => a.id === id)
  },
}