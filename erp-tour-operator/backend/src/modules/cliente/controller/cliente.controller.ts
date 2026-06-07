/* erp-tour-operator/backend/src/modules/cliente/controller/cliente.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { clienteService } from "@/modules/cliente/service/cliente.service";
import { getRequestUserId } from "@/core/utils/request-user";

export class ClienteController {
  list = async (req: Request, res: Response) => {
    const data = await clienteService.create(req.body, getRequestUserId(req));
    res.json(ok(data));
  };

  getById = async (req: Request, res: Response) => {
    const data = await clienteService.getById(Number(req.params.id));
    res.json(ok(data));
  };

  create = async (req: Request, res: Response) => {
    const data = await clienteService.create(req.body, getRequestUserId(req));
    res.status(201).json(ok(data));
  };

  update = async (req: Request, res: Response) => {
    const data = await clienteService.update(Number(req.params.id), req.body, getRequestUserId(req));
    res.json(ok(data));
  };
}

export const clienteController = new ClienteController();
