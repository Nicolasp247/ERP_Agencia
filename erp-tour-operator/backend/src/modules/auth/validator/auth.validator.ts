import { z } from "zod";

export { createUserSchema, loginSchema, updateUserRolesSchema } from "@/modules/auth/dto/auth.dto";

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});
