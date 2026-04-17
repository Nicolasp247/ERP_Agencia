import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateParams, validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { proveedorController } from "@/modules/proveedor/controller/proveedor.controller";
import { proveedorFilterSchema, proveedorIdParamSchema, proveedorSchema } from "@/modules/proveedor/validator/proveedor.validator";

export const proveedorRouter = Router();

proveedorRouter.use(authenticate);
proveedorRouter.get("/", validateQuery(proveedorFilterSchema), asyncHandler(proveedorController.list));
proveedorRouter.get("/:id", validateParams(proveedorIdParamSchema), asyncHandler(proveedorController.getById));
proveedorRouter.post("/", validateBody(proveedorSchema), asyncHandler(proveedorController.create));
proveedorRouter.put(
  "/:id",
  validateParams(proveedorIdParamSchema),
  validateBody(proveedorSchema),
  asyncHandler(proveedorController.update)
);
