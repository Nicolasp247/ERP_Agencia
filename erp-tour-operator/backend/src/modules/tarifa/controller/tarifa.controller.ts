/* erp-tour-operator/backend/src/modules/tarifa/controller/tarifa.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { tarifaService } from "@/modules/tarifa/service/tarifa.service";

export class TarifaController {
  list = async (_req: Request, res: Response) => {
    const data = await tarifaService.list();
    res.json(ok(data));
  };

  create = async (req: Request, res: Response) => {
    const data = await tarifaService.create(req.body, req.user?.id);
    res.status(201).json(ok(data));
  };

  update = async (req: Request, res: Response) => {
    const data = await tarifaService.update(Number(req.params.id), req.body, req.user?.id);
    res.json(ok(data));
  };

  delete = async (req: Request, res: Response) => {
    const data = await tarifaService.delete(Number(req.params.id));
    res.json(ok(data));
  };
}

export const tarifaController = new TarifaController();