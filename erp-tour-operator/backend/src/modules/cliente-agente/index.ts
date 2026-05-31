/* erp-tour-operator/backend/src/modules/cliente-agente/index.ts */

import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams, validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { clienteAgenteController } from "@/modules/cliente-agente/controller/cliente-agente.controller";
import {
  clienteAgenteFilterSchema,
  clienteAgenteIdParamSchema,
  clienteAgenteSchema
} from "@/modules/cliente-agente/validator/cliente-agente.validator";

export const clienteAgenteRouter = Router();

clienteAgenteRouter.use(authenticate);
clienteAgenteRouter.get("/", validateQuery(clienteAgenteFilterSchema), asyncHandler(clienteAgenteController.list));
clienteAgenteRouter.get(
  "/:id",
  validateParams(clienteAgenteIdParamSchema),
  asyncHandler(clienteAgenteController.getById)
);
clienteAgenteRouter.post("/", validateBody(clienteAgenteSchema), asyncHandler(clienteAgenteController.create));
clienteAgenteRouter.put(
  "/:id",
  validateParams(clienteAgenteIdParamSchema),
  validateBody(clienteAgenteSchema),
  asyncHandler(clienteAgenteController.update)
);
clienteAgenteRouter.patch(
  "/:id/deactivate",
  validateParams(clienteAgenteIdParamSchema),
  asyncHandler(clienteAgenteController.deactivate)
);
