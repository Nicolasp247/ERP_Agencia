/* erp-tour-operator/backend/src/modules/auth/controller/auth.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { authService } from "@/modules/auth/service/auth.service";
import { getRequestUserId } from "@/core/utils/request-user";

export class AuthController {
  login = async (req: Request, res: Response) => {
    const data = await authService.login(req.body);
    res.json(ok(data));
  };

  me = async (req: Request, res: Response) => {
    const userId = getRequestUserId(req);

    const data = await authService.me(userId!);
    res.json(ok(data));
  };

  listUsers = async (_req: Request, res: Response) => {
    const data = await authService.listUsers();
    res.json(ok(data));
  };

  listRoles = async (_req: Request, res: Response) => {
    const data = await authService.listRoles();
    res.json(ok(data));
  };

  createUser = async (req: Request, res: Response) => {
    const data = await authService.createUser(req.body);
    res.status(201).json(ok(data));
  };

  updateUserRoles = async (req: Request, res: Response) => {
    const data = await authService.updateUserRoles(Number(req.params.id), req.body);
    res.json(ok(data));
  };
}

export const authController = new AuthController();
