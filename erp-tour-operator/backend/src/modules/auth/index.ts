import { Router } from "express";

import { authenticate, requireRoles } from "@/core/middleware/authenticate";
import { validateBody, validateParams } from "@/core/middleware/validate-request";
import { asyncHandler } from "@/core/utils/async-handler";
import { authController } from "@/modules/auth/controller/auth.controller";
import {
  createUserSchema,
  loginSchema,
  updateUserRolesSchema,
  userIdParamSchema
} from "@/modules/auth/validator/auth.validator";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
authRouter.get("/roles", authenticate, requireRoles(["ADMIN"]), asyncHandler(authController.listRoles));
authRouter.get("/users", authenticate, requireRoles(["ADMIN"]), asyncHandler(authController.listUsers));
authRouter.post(
  "/users",
  authenticate,
  requireRoles(["ADMIN"]),
  validateBody(createUserSchema),
  asyncHandler(authController.createUser)
);
authRouter.put(
  "/users/:id/roles",
  authenticate,
  requireRoles(["ADMIN"]),
  validateParams(userIdParamSchema),
  validateBody(updateUserRolesSchema),
  asyncHandler(authController.updateUserRoles)
);
