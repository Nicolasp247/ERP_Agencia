/* erp-tour-operator/backend/src/modules/cliente-agente/controller/cliente-agente.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { clienteAgenteService } from "@/modules/cliente-agente/service/cliente-agente.service";

type AuthenticatedRequest = Request & {
  user?: {
    id?: number;
  };
};

function getAuthenticatedUserId(req: Request): number | undefined {
  return (req as AuthenticatedRequest).user?.id;
}

export class ClienteAgenteController {
  list = async (req: Request, res: Response) => {
    const data = await clienteAgenteService.list(req.query);
    res.json(ok(data));
  };

  getById = async (req: Request, res: Response) => {
    const data = await clienteAgenteService.getById(Number(req.params.id));
    res.json(ok(data));
  };

  create = async (req: Request, res: Response) => {
    const data = await clienteAgenteService.create(
      req.body,
      getAuthenticatedUserId(req)
    );

    res.status(201).json(ok(data));
  };

  update = async (req: Request, res: Response) => {
    const data = await clienteAgenteService.update(
      Number(req.params.id),
      req.body,
      getAuthenticatedUserId(req)
    );

    res.json(ok(data));
  };

  deactivate = async (req: Request, res: Response) => {
    const current = await clienteAgenteService.getById(Number(req.params.id));

    const data = await clienteAgenteService.update(
      Number(req.params.id),
      {
        codigo: current.codigo,
        razonSocial: current.razonSocial,
        nombreContacto: current.nombreContacto,
        telefono: current.telefono,
        email: current.email,
        direccion: current.direccion,
        nit: current.nit,
        idPais: current.pais?.id ?? null,
        idCiudad: current.ciudad?.id ?? null,
        comisionBasePct: current.comisionBasePct
          ? Number(current.comisionBasePct)
          : null,
        activo: false
      },
      getAuthenticatedUserId(req)
    );

    res.json(ok(data));
  };
}

export const clienteAgenteController = new ClienteAgenteController();