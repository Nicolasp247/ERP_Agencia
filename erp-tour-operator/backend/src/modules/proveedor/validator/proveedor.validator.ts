import { z } from "zod";

export { proveedorFilterSchema, proveedorSchema } from "@/modules/proveedor/dto/proveedor.dto";

export const proveedorIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});
