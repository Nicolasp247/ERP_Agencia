/* erp-tour-operator/backend/src/modules/cotizacion-builder/controller/cotizacion-builder.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { cotizacionBuilderService } from "@/modules/cotizacion-builder/service/cotizacion-builder.service";

export class CotizacionBuilderController {
  getByVersionId = async (req: Request, res: Response) => {
    const data = await cotizacionBuilderService.getByVersionId(Number(req.params.versionId));
    res.json(ok(data));
  };
}

export const cotizacionBuilderController = new CotizacionBuilderController();