import { Router } from "express";

import { authenticate } from "@/core/middleware/authenticate";
import { validateBody, validateQuery } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { tarifaController } from "@/modules/tarifa/controller/tarifa.controller";
import { tarifaFilterSchema, tarifaSchema } from "@/modules/tarifa/validator/tarifa.validator";

export const tarifaRouter = Router();

tarifaRouter.use(authenticate);
tarifaRouter.get("/", validateQuery(tarifaFilterSchema), asyncHandler(tarifaController.list));
tarifaRouter.post("/", validateBody(tarifaSchema), asyncHandler(tarifaController.upsert));
