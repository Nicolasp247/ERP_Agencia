/* erp-tour-operator/backend/src/modules/cotizacion-builder/controller/cotizacion-builder.controller.ts */

import type { Request, Response } from "express";

import { cotizacionBuilderColumnSchema } from "@/modules/cotizacion-builder/dto/cotizacion-builder.dto";
import { ok } from "@/core/utils/api-response";
import { cotizacionBuilderService } from "@/modules/cotizacion-builder/service/cotizacion-builder.service";

export class CotizacionBuilderController {
  getByVersionId = async (req: Request, res: Response) => {
    const data = await cotizacionBuilderService.getByVersionId(Number(req.params.versionId));
    res.json(ok(data));
  };

  createColumn = async (req: Request, res: Response) => {
    const body = cotizacionBuilderColumnSchema.parse(req.body);
    const data = await cotizacionBuilderService.createColumn(Number(req.params.versionId), body);
    res.json(ok(data));
  };

  updateColumn = async (req: Request, res: Response) => {
    const body = cotizacionBuilderColumnSchema.parse(req.body);
    const data = await cotizacionBuilderService.updateColumn(Number(req.params.columnId), body);
    res.json(ok(data));
  };

  deleteColumn = async (req: Request, res: Response) => {
    const data = await cotizacionBuilderService.deleteColumn(Number(req.params.columnId));
    res.json(ok(data));
  };
}

export const cotizacionBuilderController = new CotizacionBuilderController();