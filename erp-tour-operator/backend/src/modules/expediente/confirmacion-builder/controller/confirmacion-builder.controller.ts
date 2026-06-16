/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/controller/confirmacion-builder.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { getRequestUserId } from "@/core/utils/request-user";
import { confirmacionBuilderCreateSchema } from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import { confirmacionBuilderService } from "@/modules/expediente/confirmacion-builder/service/confirmacion-builder.service";

export class ConfirmacionBuilderController {
  getOptionsByVersionId = async (req: Request, res: Response) => {
    const data = await confirmacionBuilderService.getOptionsByVersionId(
      Number(req.params.versionId)
    );

    res.json(ok(data));
  };

  getByVersionId = async (req: Request, res: Response) => {
    const data = await confirmacionBuilderService.getByVersionId(
      Number(req.params.versionId)
    );

    res.json(ok(data));
  };

  createFromAcceptedCotizacion = async (req: Request, res: Response) => {
    const body = confirmacionBuilderCreateSchema.parse(req.body);

    const data = await confirmacionBuilderService.createFromAcceptedCotizacion(
      Number(req.params.versionId),
      body,
      getRequestUserId(req)
    );

    res.status(201).json(ok(data));
  };
}

export const confirmacionBuilderController = new ConfirmacionBuilderController();