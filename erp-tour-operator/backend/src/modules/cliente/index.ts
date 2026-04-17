import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams, validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { clienteController } from "@/modules/cliente/controller/cliente.controller";
import { clienteFilterSchema, clienteIdParamSchema, clienteSchema } from "@/modules/cliente/validator/cliente.validator";

export const clienteRouter = Router();

clienteRouter.use(authenticate);
clienteRouter.get("/", validateQuery(clienteFilterSchema), asyncHandler(clienteController.list));
clienteRouter.get("/:id", validateParams(clienteIdParamSchema), asyncHandler(clienteController.getById));
clienteRouter.post("/", validateBody(clienteSchema), asyncHandler(clienteController.create));
clienteRouter.put(
  "/:id",
  validateParams(clienteIdParamSchema),
  validateBody(clienteSchema),
  asyncHandler(clienteController.update)
);
