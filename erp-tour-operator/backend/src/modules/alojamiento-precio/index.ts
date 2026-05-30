/* erp-tour-operator/backend/src/modules/alojamiento-precio/index.ts */

import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { alojamientoPrecioController } from "@/modules/alojamiento-precio/controller/alojamiento-precio.controller";
import {
  alojamientoPrecioIdParamSchema,
  alojamientoPrecioSchema
} from "@/modules/alojamiento-precio/dto/alojamiento-precio.dto";

export const alojamientoPrecioRouter = Router();

alojamientoPrecioRouter.use(authenticate);

alojamientoPrecioRouter.get(
  "/",
  asyncHandler(alojamientoPrecioController.list)
);

alojamientoPrecioRouter.post(
  "/",
  validateBody(alojamientoPrecioSchema),
  asyncHandler(alojamientoPrecioController.create)
);

alojamientoPrecioRouter.put(
  "/:id",
  validateParams(alojamientoPrecioIdParamSchema),
  validateBody(alojamientoPrecioSchema),
  asyncHandler(alojamientoPrecioController.update)
);

alojamientoPrecioRouter.delete(
  "/:id",
  validateParams(alojamientoPrecioIdParamSchema),
  asyncHandler(alojamientoPrecioController.delete)
);