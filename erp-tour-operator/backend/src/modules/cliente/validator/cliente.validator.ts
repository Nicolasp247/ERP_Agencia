import { z } from "zod";

export { clienteFilterSchema, clienteSchema } from "@/modules/cliente/dto/cliente.dto";

export const clienteIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});
