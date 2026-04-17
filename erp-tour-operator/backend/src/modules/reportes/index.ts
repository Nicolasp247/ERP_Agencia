import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { reportesController } from "@/modules/reportes/controller/reportes.controller";
import { reporteFilterSchema } from "@/modules/reportes/validator/reportes.validator";

export const reportesRouter = Router();

reportesRouter.use(authenticate);
reportesRouter.get("/overview", asyncHandler(reportesController.overview));
reportesRouter.get(
  "/utilidad-reserva",
  validateQuery(reporteFilterSchema),
  asyncHandler(reportesController.utilidadPorReserva)
);
