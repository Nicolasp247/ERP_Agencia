/* erp-tour-operator/backend/src/modules/documento/service/documento.service.ts */

import PDFDocument from "pdfkit";

import { AppError } from "@/core/errors/app-error";
import { prisma } from "@/core/db/prisma";
import { reservaRepository } from "@/modules/reserva/repository/reserva.repository";
import type { PdfDocument } from "@/modules/documento/types/documento.types";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildPdf(title: string, lines: string[], fileName: string): Promise<PdfDocument> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 40 });

    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => {
      resolve({
        buffer: Buffer.concat(chunks),
        fileName
      });
    });
    doc.on("error", reject);

    doc.fontSize(18).text(title);
    doc.moveDown();
    doc.fontSize(11);

    for (const line of lines) {
      doc.text(line);
    }

    doc.end();
  });
}

export class DocumentoService {
  async generateCotizacionPdf(id: number) {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            nombreCompleto: true
          }
        },
        clienteAgente: {
          select: {
            razonSocial: true
          }
        },
        destinoPrincipal: {
          select: {
            nombre: true
          }
        },
        items: {
          include: {
            servicio: {
              select: {
                nombreWtravel: true
              }
            }
          },
          orderBy: [
            {
              fechaServicio: "asc"
            },
            {
              ordenDia: "asc"
            }
          ]
        }
      }
    });

    if (!cotizacion) {
      throw new AppError(404, "COTIZACION_NOT_FOUND", "Cotización no encontrada");
    }

    const lines = [
      `Codigo: COT-${cotizacion.id}`,
      `Version: ${cotizacion.versionCodigo}`,
      `Nombre: ${cotizacion.nombreCotizacion}`,
      `Cliente: ${cotizacion.cliente.nombreCompleto}`,
      `Agencia: ${cotizacion.clienteAgente?.razonSocial ?? "N/A"}`,
      `Fecha principal: ${formatDate(cotizacion.fechaViajePrincipal)}`,
      `Destino principal: ${cotizacion.destinoPrincipal?.nombre ?? "N/A"}`,
      `Moneda: ${cotizacion.monedaCodigo}`,
      `Pasajeros: ${cotizacion.totalPasajeros}`,
      "",
      "Itinerario:"
    ];

    cotizacion.items.forEach((item) => {
      lines.push(
        `${formatDate(item.fechaServicio)} | Dia ${item.ordenDia} | ${
          item.tituloOverride ?? item.servicio.nombreWtravel
        } | ${item.precioVenta?.toString() ?? "N/D"} ${item.precioMonedaCodigo}${
          item.esOpcional ? " | OPCIONAL" : ""
        }`
      );
    });

    return buildPdf(`Cotizacion ${cotizacion.nombreCotizacion}`, lines, `cotizacion-${cotizacion.id}.pdf`);
  }

  async generateReservaPdf(id: number) {
    const reserva = await reservaRepository.findById(id);

    if (!reserva) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    const lines = [
      `Codigo reserva: ${reserva.codigoReserva}`,
      `Cliente: ${reserva.cliente.nombreCompleto}`,
      `Agencia: ${reserva.clienteAgente?.razonSocial ?? "N/A"}`,
      `Fecha principal: ${formatDate(reserva.fechaViajePrincipal)}`,
      `Estado: ${reserva.estado}`,
      "",
      "Itinerario reservado:"
    ];

    reserva.items.forEach((item) => {
      lines.push(
        `${formatDate(item.fechaServicio)} | Dia ${item.ordenDia} | ${
          item.tituloSnapshot ?? item.servicio.nombreWtravel
        } | Confirmacion: ${item.numeroConfirmacion ?? "Pendiente"} | Costo final: ${
          item.costoFinal?.toString() ?? "N/D"
        } ${item.monedaCodigo}`
      );
    });

    return buildPdf(`Reserva ${reserva.codigoReserva}`, lines, `reserva-${reserva.codigoReserva}.pdf`);
  }

  async generateConfirmacionPdf(id: number) {
    const reserva = await reservaRepository.findById(id);

    if (!reserva) {
      throw new AppError(404, "RESERVA_NOT_FOUND", "Reserva no encontrada");
    }

    const confirmacion = reserva.confirmacionesComerciales.find((item) => item.estado === "ACTIVA");

    if (!confirmacion) {
      throw new AppError(409, "SIN_CONFIRMACION_COMERCIAL", "No existe confirmación comercial activa");
    }

    const lines = [
      `Reserva: ${reserva.codigoReserva}`,
      `Version confirmacion: ${confirmacion.version}`,
      `Fecha confirmacion: ${formatDate(confirmacion.fechaConfirmacion)}`,
      `Total venta confirmada: ${confirmacion.totalVentaConfirmada.toString()} ${confirmacion.monedaCodigo}`,
      ""
    ];

    confirmacion.items.forEach((item) => {
      lines.push(
        `Item ${item.idReservaItem} | Venta confirmada: ${item.precioVentaConfirmado.toString()} | Opcional vendido: ${
          item.esOpcionalVendido ? "SI" : "NO"
        }`
      );
    });

    return buildPdf(
      `Confirmacion comercial ${reserva.codigoReserva}`,
      lines,
      `confirmacion-${reserva.codigoReserva}.pdf`
    );
  }
}

export const documentoService = new DocumentoService();