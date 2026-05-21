/* erp-tour-operator/backend/src/modules/tarifa/index.ts */

import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { tarifaController } from "@/modules/tarifa/controller/tarifa.controller";
import { tarifaIdParamSchema, tarifaSchema } from "@/modules/tarifa/dto/tarifa.dto";

export const tarifaRouter = Router();

tarifaRouter.use(authenticate);

tarifaRouter.get("/", asyncHandler(tarifaController.list));

tarifaRouter.post(
  "/",
  validateBody(tarifaSchema),
  asyncHandler(tarifaController.create)
);

tarifaRouter.put(
  "/:id",
  validateParams(tarifaIdParamSchema),
  validateBody(tarifaSchema),
  asyncHandler(tarifaController.update)
);

tarifaRouter.delete(
  "/:id",
  validateParams(tarifaIdParamSchema),
  asyncHandler(tarifaController.delete)
);