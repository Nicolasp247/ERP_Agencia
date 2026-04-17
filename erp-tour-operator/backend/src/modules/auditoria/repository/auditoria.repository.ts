import { Prisma } from "@prisma/client";
import { prisma } from "@/core/db/prisma";
import type { AuditoriaQuery } from "@/modules/auditoria/dto/auditoria.dto";
import type { AuditPayload } from "@/modules/auditoria/types/auditoria.types";

export class AuditoriaRepository {
  create(payload: AuditPayload) {
    return prisma.auditoriaEvento.create({
      data: {
        entidad: payload.entidad,
        entidadId: payload.entidadId,
        accion: payload.accion,
        valorAnterior: payload.valorAnterior as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
        valorNuevo: payload.valorNuevo as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
        idUsuario: payload.idUsuario ?? null
      }
    });
  }

  list(query: AuditoriaQuery) {
    return prisma.auditoriaEvento.findMany({
      where: {
        entidad: query.entidad,
        entidadId: query.entidadId,
        accion: query.accion
      },
      orderBy: {
        fechaEvento: "desc"
      }
    });
  }
}

export const auditoriaRepository = new AuditoriaRepository();
