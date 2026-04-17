import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { tarifaService } from "@/modules/tarifa/service/tarifa.service";

export class TarifaController {
  list = async (req: Request, res: Response) => {
    const data = await tarifaService.list(req.query);
    res.json(ok(data));
  };

  upsert = async (req: Request, res: Response) => {
    const data = await tarifaService.upsert(req.body, req.user?.id);
    res.status(201).json(ok(data));
  };
}

export const tarifaController = new TarifaController();
