//src/feature/equipament/types.ts

export interface Equipment {
  id: number
  nome: string
  codigo: string
  estado: 'disponivel' | 'reservado' | 'em_uso' | 'manutencao' | 'inativo'
  createdAt: string
}

export interface CreateEquipmentDTO {
  nome: string
  codigo: string
  estado: 'disponivel' | 'reservado' | 'em_uso' | 'manutencao' | 'inativo'
}