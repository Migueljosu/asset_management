const { z } = require("zod");

const createEquipmentSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
});

const updateEquipmentSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  estado: z.enum(["disponivel", "reservado", "em_uso", "manutencao", "inativo"]).optional(),
});

module.exports = { createEquipmentSchema, updateEquipmentSchema };

