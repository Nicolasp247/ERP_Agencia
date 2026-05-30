/* erp-tour-operator/backend/src/modules/alojamiento-precio/controller/alojamiento-precio.controller.ts */

import type { Request, Response } from "express";

import {
  alojamientoPrecioFilterSchema,
  alojamientoPrecioIdParamSchema,
  alojamientoPrecioSchema
} from "@/modules/alojamiento-precio/dto/alojamiento-precio.dto";
import { alojamientoPrecioService } from "@/modules/alojamiento-precio/service/alojamiento-precio.service";

export class AlojamientoPrecioController {
  async list(req: Request, res: Response) {
    const filters = alojamientoPrecioFilterSchema.parse(req.query);
    const data = await alojamientoPrecioService.list(filters);

    res.json({
      success: true,
      data
    });
  }

  async create(req: Request, res: Response) {
    const input = alojamientoPrecioSchema.parse(req.body);
    const data = await alojamientoPrecioService.create(input);

    res.status(201).json({
      success: true,
      data
    });
  }

  async update(req: Request, res: Response) {
    const params = alojamientoPrecioIdParamSchema.parse(req.params);
    const input = alojamientoPrecioSchema.parse(req.body);
    const data = await alojamientoPrecioService.update(params.id, input);

    res.json({
      success: true,
      data
    });
  }

  async delete(req: Request, res: Response) {
    const params = alojamientoPrecioIdParamSchema.parse(req.params);
    const data = await alojamientoPrecioService.delete(params.id);

    res.json({
      success: true,
      data
    });
  }
}

export const alojamientoPrecioController = new AlojamientoPrecioController();