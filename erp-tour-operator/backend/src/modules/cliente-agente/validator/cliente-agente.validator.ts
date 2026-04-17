import { z } from "zod";

export { clienteAgenteFilterSchema, clienteAgenteSchema } from "@/modules/cliente-agente/dto/cliente-agente.dto";

export const clienteAgenteIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});
