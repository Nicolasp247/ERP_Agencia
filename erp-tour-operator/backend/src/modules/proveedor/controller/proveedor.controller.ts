import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { proveedorService } from "@/modules/proveedor/service/proveedor.service";

export class ProveedorController {
  list = async (req: Request, res: Response) => {
    const data = await proveedorService.list(req.query);
    res.json(ok(data));
  };

  getById = async (req: Request, res: Response) => {
    const data = await proveedorService.getById(Number(req.params.id));
    res.json(ok(data));
  };

  create = async (req: Request, res: Response) => {
    const data = await proveedorService.create(req.body, req.user?.id);
    res.status(201).json(ok(data));
  };

  update = async (req: Request, res: Response) => {
    const data = await proveedorService.update(Number(req.params.id), req.body, req.user?.id);
    res.json(ok(data));
  };
}

export const proveedorController = new ProveedorController();
