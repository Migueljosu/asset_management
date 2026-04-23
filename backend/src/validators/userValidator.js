const { z } = require("zod");

const createUserSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  perfil: z.enum(["admin", "tecnico", "funcionario"], {
    invalid_type_error: "Perfil inválido",
  }),
});

const updateUserSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  perfil: z.enum(["admin", "tecnico", "funcionario"]).optional(),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
});

const changePasswordSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

const updateProfileSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
});

module.exports = { createUserSchema, updateUserSchema, changePasswordSchema, updateProfileSchema };

