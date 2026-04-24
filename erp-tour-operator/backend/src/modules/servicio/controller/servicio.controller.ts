import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { servicioService } from "@/modules/servicio/service/servicio.service";
import type { ServicioFilters } from "../dto/servicio.dto";

export class ServicioController {
  listTipos = async (_req: Request, res: Response) => {
    const data = await servicioService.listTipos();
    res.json(ok(data));
  };

  createTipo = async (req: Request, res: Response) => {
    const data = await servicioService.createTipo(req.body);
    res.status(201).json(ok(data));
  };

  updateTipo = async (req: Request, res: Response) => {
    const data = await servicioService.updateTipo(Number(req.params.id), req.body);
    res.json(ok(data));
  };

  list = async (req: Request, res: Response) => {
    const filters =
      ((req as Request & { validatedQuery?: ServicioFilters }).validatedQuery as ServicioFilters) ??
      (req.query as unknown as ServicioFilters);

    const data = await servicioService.list(filters);
    res.json(ok(data));
  };

  getById = async (req: Request, res: Response) => {
    const data = await servicioService.getById(Number(req.params.id));
    res.json(ok(data));
  };

  create = async (req: Request, res: Response) => {
    const data = await servicioService.create(req.body, req.user?.id);
    res.status(201).json(ok(data));
  };

  update = async (req: Request, res: Response) => {
    const data = await servicioService.update(Number(req.params.id), req.body, req.user?.id);
    res.json(ok(data));
  };

  listIdiomas = async (_req: Request, res: Response) => {
    const data = await servicioService.listIdiomas();
    res.json(ok(data));
  };

  listTiposGuia = async (_req: Request, res: Response) => {
    const data = await servicioService.listTiposGuia();
    res.json(ok(data));
  };

  listPuntosTraslado = async (req: Request, res: Response) => {
    const query = (req as Request & { validatedQuery?: { idCiudad: number } }).validatedQuery;
    const idCiudad = query?.idCiudad ?? Number(req.query.idCiudad);

    const data = await servicioService.listPuntosTraslado(idCiudad);
    res.json(ok(data));
  };

}

export const servicioController = new ServicioController();
