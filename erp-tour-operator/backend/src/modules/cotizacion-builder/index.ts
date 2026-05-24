/* erp-tour-operator/backend/src/modules/cotizacion-builder/index.ts */

import { Router } from "express";
import { z } from "zod";

import { authenticate } from "@/core/middleware/authenticate";
import { validateParams } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { cotizacionBuilderController } from "@/modules/cotizacion-builder/controller/cotizacion-builder.controller";

const cotizacionBuilderParamsSchema = z.object({
  versionId: z.coerce.number().int().positive()
});

export const cotizacionBuilderRouter = Router();

cotizacionBuilderRouter.use(authenticate);

cotizacionBuilderRouter.get(
  "/:versionId",
  validateParams(cotizacionBuilderParamsSchema),
  asyncHandler(cotizacionBuilderController.getByVersionId)
);