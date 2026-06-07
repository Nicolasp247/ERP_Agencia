/* erp-tour-operator/backend/src/modules/expediente/controller/expediente.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { expedienteService } from "@/modules/expediente/service/expediente.service";
import { reservaService } from "@/modules/reserva/service/reserva.service";

function getUserId(req: Request): number | undefined {
  return (req as Request & { user?: { id?: number } }).user?.id;
}

class ExpedienteController {
  list = async (req: Request, res: Response) => {
    const data = await expedienteService.list(req.query);
    res.json(ok(data));
  };

  getById = async (req: Request, res: Response) => {
    const data = await expedienteService.getById(Number(req.params.id));
    res.json(ok(data));
  };

  create = async (req: Request, res: Response) => {
    const data = await expedienteService.create(req.body, getUserId(req));
    res.status(201).json(ok(data));
  };

  update = async (req: Request, res: Response) => {
    const data = await expedienteService.update(Number(req.params.id), req.body, getUserId(req));
    res.json(ok(data));
  };

  discard = async (req: Request, res: Response) => {
    const data = await expedienteService.discard(Number(req.params.id), getUserId(req));
    res.json(ok(data));
  };

  convertToReserva = async (req: Request, res: Response) => {
    const data = await reservaService.convertFromCotizacion(Number(req.params.id), getUserId(req));
    res.status(201).json(ok(data));
  };
}

export const expedienteController = new ExpedienteController();