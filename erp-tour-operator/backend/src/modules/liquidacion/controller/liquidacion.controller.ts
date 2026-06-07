/* erp-tour-operator/backend/src/modules/liquidacion/controller/liquidacion.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { liquidacionService } from "@/modules/liquidacion/service/liquidacion.service";
import { getRequestUserId } from "@/core/utils/request-user";

export class LiquidacionController {
  registerConfirmacionComercial = async (req: Request, res: Response) => {
    const data = await liquidacionService.registerConfirmacionComercial(
      Number(req.params.id),
      req.body,
      getRequestUserId(req)
    );
    res.status(201).json(ok(data));
  };

  recalculate = async (req: Request, res: Response) => {
    const data = await liquidacionService.recalculate(Number(req.params.id), getRequestUserId(req));
    res.json(ok(data));
  };

  close = async (req: Request, res: Response) => {
    const data = await liquidacionService.close(Number(req.params.id), getRequestUserId(req));
    res.json(ok(data));
  };
}

export const liquidacionController = new LiquidacionController();
