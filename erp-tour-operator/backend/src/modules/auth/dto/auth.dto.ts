import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const createUserSchema = z.object({
  nombre: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(6),
  roleCodes: z.array(z.string().min(1)).default(["OPERACIONES"])
});

export const updateUserRolesSchema = z.object({
  roleCodes: z.array(z.string().min(1)).min(1)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;
