/* erp-tour-operator/backend/src/modules/cotizacion-builder/controller/cotizacion-builder.controller.ts */

import type { Request, Response } from "express";

import {
  cotizacionBuilderColumnSchema,
  cotizacionBuilderItemSchema,
  cotizacionBuilderMoveItemSchema,
  cotizacionBuilderColumnShownPriceSchema,
  cotizacionBuilderNoteSchema,
  cotizacionBuilderPriceSchema
} from "@/modules/cotizacion-builder/dto/cotizacion-builder.dto";
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

  updateColumnShownPrice = async (req: Request, res: Response) => {
    const body = cotizacionBuilderColumnShownPriceSchema.parse(req.body);
    const data = await cotizacionBuilderService.updateColumnShownPrice(
      Number(req.params.columnId),
      body
    );
    res.json(ok(data));
  };

  deleteColumn = async (req: Request, res: Response) => {
    const data = await cotizacionBuilderService.deleteColumn(Number(req.params.columnId));
    res.json(ok(data));
  };

  createItem = async (req: Request, res: Response) => {
    const body = cotizacionBuilderItemSchema.parse(req.body);
    const data = await cotizacionBuilderService.createItem(Number(req.params.versionId), body);
    res.json(ok(data));
  };

  deleteItem = async (req: Request, res: Response) => {
    const data = await cotizacionBuilderService.deleteItem(Number(req.params.itemId));
    res.json(ok(data));
  };

  updateItemPrices = async (req: Request, res: Response) => {
    const body = cotizacionBuilderPriceSchema.parse(req.body);
    const data = await cotizacionBuilderService.updateItemPrices(Number(req.params.itemId), body);
    res.json(ok(data));
  };

  moveItem = async (req: Request, res: Response) => {
    const body = cotizacionBuilderMoveItemSchema.parse(req.body);
    const data = await cotizacionBuilderService.moveItem(Number(req.params.itemId), body);
    res.json(ok(data));
  };

  updateItemNotes = async (req: Request, res: Response) => {
    const body = cotizacionBuilderNoteSchema.parse(req.body);
    const data = await cotizacionBuilderService.updateItemNotes(Number(req.params.itemId), body);
    res.json(ok(data));
  };
}

export const cotizacionBuilderController = new CotizacionBuilderController();