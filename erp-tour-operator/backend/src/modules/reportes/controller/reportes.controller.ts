import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { reportesService } from "@/modules/reportes/service/reportes.service";

export class ReportesController {
  overview = async (_req: Request, res: Response) => {
    const data = await reportesService.overview();
    res.json(ok(data));
  };

  utilidadPorReserva = async (req: Request, res: Response) => {
    const data = await reportesService.utilidadPorReserva(req.query);
    res.json(ok(data));
  };
}

export const reportesController = new ReportesController();
