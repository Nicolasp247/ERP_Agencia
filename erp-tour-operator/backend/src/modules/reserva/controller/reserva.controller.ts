/* erp-tour-operator/backend/src/modules/reserva/controller/reserva.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { reservaService } from "@/modules/reserva/service/reserva.service";
import { getRequestUserId } from "@/core/utils/request-user";

export class ReservaController {
  list = async (req: Request, res: Response) => {
    const data = await reservaService.list(req.query);
    res.json(ok(data));
  };

  getById = async (req: Request, res: Response) => {
    const data = await reservaService.getById(Number(req.params.id));
    res.json(ok(data));
  };

  updateOperational = async (req: Request, res: Response) => {
    const data = await reservaService.updateOperational(Number(req.params.id), req.body, getRequestUserId(req));
    res.json(ok(data));
  };

  registerItemConfirmation = async (req: Request, res: Response) => {
    const data = await reservaService.registerItemConfirmation(
      Number(req.params.id),
      Number(req.params.itemId),
      req.body,
      getRequestUserId(req)
    );
    res.json(ok(data));
  };

  cancel = async (req: Request, res: Response) => {
    const data = await reservaService.cancel(Number(req.params.id), req.body, getRequestUserId(req));
    res.json(ok(data));
  };
}

export const reservaController = new ReservaController();
