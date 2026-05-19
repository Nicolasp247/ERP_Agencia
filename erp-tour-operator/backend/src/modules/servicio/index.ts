/* erp-tour-operator/backend/src/modules/servicio/index.ts */


import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams, validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { servicioController } from "@/modules/servicio/controller/servicio.controller";
import {
  servicioFilterSchema,
  servicioIdParamSchema,
  servicioSchema,
  tipoServicioSchema
} from "@/modules/servicio/validator/servicio.validator";
import { puntoTrasladoFilterSchema } from "@/modules/servicio/dto/servicio.dto";

export const servicioRouter = Router();

servicioRouter.use(authenticate);

servicioRouter.get("/tipos", asyncHandler(servicioController.listTipos));
servicioRouter.post("/tipos", validateBody(tipoServicioSchema), asyncHandler(servicioController.createTipo));
servicioRouter.put(
  "/tipos/:id",
  validateParams(servicioIdParamSchema),
  validateBody(tipoServicioSchema),
  asyncHandler(servicioController.updateTipo)
);

servicioRouter.get("/", validateQuery(servicioFilterSchema), asyncHandler(servicioController.list));
servicioRouter.get("/idiomas", asyncHandler(servicioController.listIdiomas));
servicioRouter.get("/tipos-guia", asyncHandler(servicioController.listTiposGuia));
servicioRouter.get(
  "/puntos-traslado",
  validateQuery(puntoTrasladoFilterSchema),
  asyncHandler(servicioController.listPuntosTraslado)
);
servicioRouter.patch("/:id/estado", servicioController.updateEstado);
servicioRouter.get("/:id", validateParams(servicioIdParamSchema), asyncHandler(servicioController.getById));
servicioRouter.post("/", validateBody(servicioSchema), asyncHandler(servicioController.create));
servicioRouter.put(
  "/:id",
  validateParams(servicioIdParamSchema),
  validateBody(servicioSchema),
  asyncHandler(servicioController.update)
);