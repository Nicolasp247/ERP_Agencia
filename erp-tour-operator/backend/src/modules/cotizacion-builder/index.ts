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

const cotizacionBuilderColumnParamsSchema = z.object({
  columnId: z.coerce.number().int().positive()
});

const cotizacionBuilderItemParamsSchema = z.object({
  itemId: z.coerce.number().int().positive()
});

export const cotizacionBuilderRouter = Router();

cotizacionBuilderRouter.use(authenticate);

cotizacionBuilderRouter.put(
  "/:versionId/commission",
  validateParams(cotizacionBuilderParamsSchema),
  asyncHandler(cotizacionBuilderController.updateCommission)
);

cotizacionBuilderRouter.put(
  "/items/:itemId/hotels",
  validateParams(cotizacionBuilderItemParamsSchema),
  asyncHandler(cotizacionBuilderController.updateItemHotels)
);

cotizacionBuilderRouter.get(
  "/:versionId",
  validateParams(cotizacionBuilderParamsSchema),
  asyncHandler(cotizacionBuilderController.getByVersionId)
);

cotizacionBuilderRouter.post(
  "/:versionId/columns",
  validateParams(cotizacionBuilderParamsSchema),
  asyncHandler(cotizacionBuilderController.createColumn)
);

cotizacionBuilderRouter.put(
  "/columns/:columnId/shown-price",
  validateParams(cotizacionBuilderColumnParamsSchema),
  asyncHandler(cotizacionBuilderController.updateColumnShownPrice)
);

cotizacionBuilderRouter.put(
  "/columns/:columnId",
  validateParams(cotizacionBuilderColumnParamsSchema),
  asyncHandler(cotizacionBuilderController.updateColumn)
);

cotizacionBuilderRouter.delete(
  "/columns/:columnId",
  validateParams(cotizacionBuilderColumnParamsSchema),
  asyncHandler(cotizacionBuilderController.deleteColumn)
);

cotizacionBuilderRouter.post(
  "/:versionId/items",
  validateParams(cotizacionBuilderParamsSchema),
  asyncHandler(cotizacionBuilderController.createItem)
);

cotizacionBuilderRouter.delete(
  "/items/:itemId",
  validateParams(cotizacionBuilderItemParamsSchema),
  asyncHandler(cotizacionBuilderController.deleteItem)
);

cotizacionBuilderRouter.put(
  "/items/:itemId/prices",
  validateParams(cotizacionBuilderItemParamsSchema),
  asyncHandler(cotizacionBuilderController.updateItemPrices)
);

cotizacionBuilderRouter.put(
  "/items/:itemId/move",
  validateParams(cotizacionBuilderItemParamsSchema),
  asyncHandler(cotizacionBuilderController.moveItem)
);

cotizacionBuilderRouter.put(
  "/items/:itemId/notes",
  validateParams(cotizacionBuilderItemParamsSchema),
  asyncHandler(cotizacionBuilderController.updateItemNotes)
);