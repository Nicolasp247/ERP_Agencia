import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { clienteService } from "@/modules/cliente/service/cliente.service";

export class ClienteController {
  list = async (req: Request, res: Response) => {
    const data = await clienteService.list(req.query);
    res.json(ok(data));
  };

  getById = async (req: Request, res: Response) => {
    const data = await clienteService.getById(Number(req.params.id));
    res.json(ok(data));
  };

  create = async (req: Request, res: Response) => {
    const data = await clienteService.create(req.body, req.user?.id);
    res.status(201).json(ok(data));
  };

  update = async (req: Request, res: Response) => {
    const data = await clienteService.update(Number(req.params.id), req.body, req.user?.id);
    res.json(ok(data));
  };
}

export const clienteController = new ClienteController();
