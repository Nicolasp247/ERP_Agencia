import { z } from "zod";

export const liquidacionReservaIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const confirmacionComercialSchema = z.object({
  observacion: z.string().optional().nullable(),
  items: z.array(
    z.object({
      idReservaItem: z.coerce.number().int().positive(),
      precioVentaConfirmado: z.coerce.number().nonnegative(),
      esOpcionalVendido: z.boolean().default(false)
    })
  )
});

export type ConfirmacionComercialInput = z.infer<typeof confirmacionComercialSchema>;
