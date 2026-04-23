export interface TransferItem {
  id: number
  equipmentId: number
  equipmentName: string
  originSectorId: number
  originSectorName: string
  destinationSectorId: number
  destinationSectorName: string
  transferredAt: string
}

export interface TransferableEquipment {
  equipmentId: number
  equipmentName: string
  currentSectorId: number
  currentSectorName: string
  loanId: number
}

export interface CreateTransferDTO {
  equipmentId: number
  destinationSectorId: number
}
