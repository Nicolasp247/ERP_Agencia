import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { cotizacionService } from "@/modules/cotizacion/service/cotizacion.service";
import { reservaService } from "@/modules/reserva/service/reserva.service";

export class CotizacionController {
  list = async (req: Request, res: Response) => {
    const data = await cotizacionService.list(req.query);
    res.json(ok(data));
  };

  getById = async (req: Request, res: Response) => {
    const data = await cotizacionService.getById(Number(req.params.id));
    res.json(ok(data));
  };

  create = async (req: Request, res: Response) => {
    const data = await cotizacionService.create(req.body, req.user?.id);
    res.status(201).json(ok(data));
  };

  update = async (req: Request, res: Response) => {
    const data = await cotizacionService.update(Number(req.params.id), req.body, req.user?.id);
    res.json(ok(data));
  };

  discard = async (req: Request, res: Response) => {
    const data = await cotizacionService.discard(Number(req.params.id), req.user?.id);
    res.json(ok(data));
  };

  convertToReserva = async (req: Request, res: Response) => {
    const data = await reservaService.convertFromCotizacion(Number(req.params.id), req.user?.id);
    res.status(201).json(ok(data));
  };
}

export const cotizacionController = new CotizacionController();
