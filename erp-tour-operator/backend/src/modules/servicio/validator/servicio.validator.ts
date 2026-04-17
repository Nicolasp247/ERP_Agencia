import { z } from "zod";

export { servicioFilterSchema, servicioSchema, tipoServicioSchema } from "@/modules/servicio/dto/servicio.dto";

export const servicioIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});
