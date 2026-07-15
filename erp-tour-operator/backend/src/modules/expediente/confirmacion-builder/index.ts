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

const confirmacionPassengerReservaParamsSchema = z.object({
  reservaId: z.coerce.number().int().positive()
});

const confirmacionPassengerParamsSchema = z.object({
  passengerId: z.coerce.number().int().positive()
});

const confirmacionBuilderItemParamsSchema = z.object({
  itemId: z.coerce.number().int().positive()
});

export const confirmacionBuilderRouter = Router();

confirmacionBuilderRouter.use(authenticate);

confirmacionBuilderRouter.get(
  "/versiones/:versionId/opciones",
  validateParams(confirmacionBuilderParamsSchema),
  asyncHandler(confirmacionBuilderController.getOptionsByVersionId)
);

confirmacionBuilderRouter.put(
  "/versiones/:versionId/free-notes",
  validateParams(confirmacionBuilderParamsSchema),
  asyncHandler(confirmacionBuilderController.updateFreeNotes)
);

confirmacionBuilderRouter.put(
  "/items/:itemId/prices",
  validateParams(confirmacionBuilderItemParamsSchema),
  asyncHandler(confirmacionBuilderController.updateItemPrices)
);

confirmacionBuilderRouter.put(
  "/items/:itemId/notes",
  validateParams(confirmacionBuilderItemParamsSchema),
  asyncHandler(confirmacionBuilderController.updateItemNotes)
);

confirmacionBuilderRouter.put(
  "/items/:itemId/hotels",
  validateParams(confirmacionBuilderItemParamsSchema),
  asyncHandler(confirmacionBuilderController.updateItemHotels)
);

confirmacionBuilderRouter.put(
  "/items/:itemId/move",
  validateParams(confirmacionBuilderItemParamsSchema),
  asyncHandler(confirmacionBuilderController.moveItem)
);

confirmacionBuilderRouter.delete(
  "/items/:itemId",
  validateParams(confirmacionBuilderItemParamsSchema),
  asyncHandler(confirmacionBuilderController.deleteItem)
);

confirmacionBuilderRouter.post(
  "/versiones/:versionId",
  validateParams(confirmacionBuilderParamsSchema),
  asyncHandler(confirmacionBuilderController.createFromAcceptedCotizacion)
);

confirmacionBuilderRouter.delete(
  "/versiones/:versionId",
  validateParams(confirmacionBuilderParamsSchema),
  asyncHandler(confirmacionBuilderController.deleteByVersionId)
);

confirmacionBuilderRouter.post(
  "/reservas/:reservaId/items",
  validateParams(confirmacionPassengerReservaParamsSchema),
  asyncHandler(confirmacionBuilderController.createItem)
);

confirmacionBuilderRouter.post(
  "/reservas/:reservaId/pasajeros",
  validateParams(confirmacionPassengerReservaParamsSchema),
  asyncHandler(confirmacionBuilderController.createPassenger)
);

confirmacionBuilderRouter.put(
  "/pasajeros/:passengerId",
  validateParams(confirmacionPassengerParamsSchema),
  asyncHandler(confirmacionBuilderController.updatePassenger)
);

confirmacionBuilderRouter.delete(
  "/pasajeros/:passengerId",
  validateParams(confirmacionPassengerParamsSchema),
  asyncHandler(confirmacionBuilderController.deletePassenger)
);

confirmacionBuilderRouter.get(
  "/versiones/:versionId",
  validateParams(confirmacionBuilderParamsSchema),
  asyncHandler(confirmacionBuilderController.getByVersionId)
);