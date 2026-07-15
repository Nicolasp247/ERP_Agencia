/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/controller/confirmacion-builder.controller.ts */

import type { Request, Response } from "express";

import { ok } from "@/core/utils/api-response";
import { getRequestUserId } from "@/core/utils/request-user";
import {
  confirmacionBuilderCreateSchema,
  confirmacionBuilderFreeNotesSchema,
  confirmacionBuilderHotelPreviewSchema,
  confirmacionBuilderMoveItemSchema,
  confirmacionBuilderNoteSchema,
  confirmacionBuilderPriceSchema,
  confirmacionPassengerSchema
} from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
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

  createPassenger = async (req: Request, res: Response) => {
    const body = confirmacionPassengerSchema.parse(req.body);

    const data = await confirmacionBuilderService.createPassenger(
      Number(req.params.reservaId),
      body,
      getRequestUserId(req)
    );

    res.status(201).json(ok(data));
  };

  updatePassenger = async (req: Request, res: Response) => {
    const body = confirmacionPassengerSchema.parse(req.body);

    const data = await confirmacionBuilderService.updatePassenger(
      Number(req.params.passengerId),
      body,
      getRequestUserId(req)
    );

    res.json(ok(data));
  };

  deletePassenger = async (req: Request, res: Response) => {
    const data = await confirmacionBuilderService.deletePassenger(
      Number(req.params.passengerId)
    );

    res.json(ok(data));
  };

  updateItemPrices = async (req: Request, res: Response) => {
    const body = confirmacionBuilderPriceSchema.parse(req.body);

    const data = await confirmacionBuilderService.updateItemPrices(
      Number(req.params.itemId),
      body
    );

    res.json(ok(data));
  };

  updateItemNotes = async (req: Request, res: Response) => {
    const body = confirmacionBuilderNoteSchema.parse(req.body);

    const data = await confirmacionBuilderService.updateItemNotes(
      Number(req.params.itemId),
      body
    );

    res.json(ok(data));
  };

  updateItemHotels = async (req: Request, res: Response) => {
    const body = confirmacionBuilderHotelPreviewSchema.parse(req.body);

    const data = await confirmacionBuilderService.updateItemHotels(
      Number(req.params.itemId),
      body
    );

    res.json(ok(data));
  };

  moveItem = async (req: Request, res: Response) => {
    const body = confirmacionBuilderMoveItemSchema.parse(req.body);

    const data = await confirmacionBuilderService.moveItem(
      Number(req.params.itemId),
      body
    );

    res.json(ok(data));
  };

  deleteItem = async (req: Request, res: Response) => {
    const data = await confirmacionBuilderService.deleteItem(
      Number(req.params.itemId)
    );

    res.json(ok(data));
  };

  updateFreeNotes = async (req: Request, res: Response) => {
    const body = confirmacionBuilderFreeNotesSchema.parse(req.body);

    const data = await confirmacionBuilderService.updateFreeNotes(
      Number(req.params.versionId),
      body
    );

    res.json(ok(data));
  };

  deleteByVersionId = async (req: Request, res: Response) => {
    const data = await confirmacionBuilderService.deleteByVersionId(
      Number(req.params.versionId),
      getRequestUserId(req)
    );

    res.json(ok(data));
  };

}

export const confirmacionBuilderController = new ConfirmacionBuilderController();