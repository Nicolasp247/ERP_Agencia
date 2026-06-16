/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/index.ts */

import { Router } from "express";
import { z } from "zod";

import { authenticate } from "@/core/middleware/authenticate";
import { validateParams } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { confirmacionBuilderController } from "@/modules/expediente/confirmacion-builder/controller/confirmacion-builder.controller";

const confirmacionBuilderParamsSchema = z.object({
  versionId: z.coerce.number().int().positive()
});

export const confirmacionBuilderRouter = Router();

confirmacionBuilderRouter.use(authenticate);

confirmacionBuilderRouter.get(
  "/versiones/:versionId/opciones",
  validateParams(confirmacionBuilderParamsSchema),
  asyncHandler(confirmacionBuilderController.getOptionsByVersionId)
);

confirmacionBuilderRouter.post(
  "/versiones/:versionId",
  validateParams(confirmacionBuilderParamsSchema),
  asyncHandler(confirmacionBuilderController.createFromAcceptedCotizacion)
);

confirmacionBuilderRouter.get(
  "/versiones/:versionId",
  validateParams(confirmacionBuilderParamsSchema),
  asyncHandler(confirmacionBuilderController.getByVersionId)
);