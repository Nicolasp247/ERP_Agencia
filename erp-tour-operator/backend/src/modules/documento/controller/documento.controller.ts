import type { Request, Response } from "express";

import { documentoService } from "@/modules/documento/service/documento.service";

export class DocumentoController {
  cotizacionPdf = async (req: Request, res: Response) => {
    const document = await documentoService.generateCotizacionPdf(Number(req.params.id));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=\"${document.fileName}\"`);
    res.send(document.buffer);
  };

  reservaPdf = async (req: Request, res: Response) => {
    const document = await documentoService.generateReservaPdf(Number(req.params.id));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=\"${document.fileName}\"`);
    res.send(document.buffer);
  };

  confirmacionPdf = async (req: Request, res: Response) => {
    const document = await documentoService.generateConfirmacionPdf(Number(req.params.id));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=\"${document.fileName}\"`);
    res.send(document.buffer);
  };
}

export const documentoController = new DocumentoController();
