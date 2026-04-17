import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";

export class AuditoriaController {
  list = async (req: Request, res: Response) => {
    const data = await auditoriaService.list(req.query);
    res.json(ok(data));
  };
}

export const auditoriaController = new AuditoriaController();
