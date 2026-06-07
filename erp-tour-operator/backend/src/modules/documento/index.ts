import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateParams } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { expedienteIdParamSchema } from "@/modules/expediente/validator/expediente.validator";
import { documentoController } from "@/modules/documento/controller/documento.controller";
import { reservaIdParamSchema } from "@/modules/reserva/validator/reserva.validator";

export const documentoRouter = Router();

documentoRouter.use(authenticate);
documentoRouter.get(
  "/cotizacion/:id/pdf",
  validateParams(expedienteIdParamSchema),
  asyncHandler(documentoController.cotizacionPdf)
);
documentoRouter.get(
  "/reserva/:id/pdf",
  validateParams(reservaIdParamSchema),
  asyncHandler(documentoController.reservaPdf)
);
documentoRouter.get(
  "/reserva/:id/confirmacion/pdf",
  validateParams(reservaIdParamSchema),
  asyncHandler(documentoController.confirmacionPdf)
);
