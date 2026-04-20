import { Request, Response } from "express";
import { asyncHandler } from "@/core/utils/async-handler";
import { geoService } from "../service/geo.service";
import { geoValidator } from "../validator/geo.validator";

export const geoController = {
  getContinentes: asyncHandler(async (_req: Request, res: Response) => {
    const data = await geoService.listContinentes();

    res.status(200).json({
      success: true,
      data
    });
  }),

  getPaises: asyncHandler(async (req: Request, res: Response) => {
    const idContinente = geoValidator.parseOptionalNumber(req.query.idContinente);

    const data = await geoService.listPaises(idContinente);

    res.status(200).json({
      success: true,
      data
    });
  }),

  getCiudades: asyncHandler(async (req: Request, res: Response) => {
    const idPais = geoValidator.parseOptionalNumber(req.query.idPais);

    const data = await geoService.listCiudades(idPais);

    res.status(200).json({
      success: true,
      data
    });
  })
};