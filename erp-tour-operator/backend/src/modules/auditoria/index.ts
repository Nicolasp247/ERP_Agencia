import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { auditoriaController } from "@/modules/auditoria/controller/auditoria.controller";
import { auditoriaQuerySchema } from "@/modules/auditoria/validator/auditoria.validator";

export const auditoriaRouter = Router();

auditoriaRouter.get(
  "/",
  authenticate,
  validateQuery(auditoriaQuerySchema),
  asyncHandler(auditoriaController.list)
);
