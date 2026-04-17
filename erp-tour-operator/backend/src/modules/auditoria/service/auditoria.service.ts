import type { AuditoriaQuery } from "@/modules/auditoria/dto/auditoria.dto";
import { toAuditEventResponse } from "@/modules/auditoria/mapper/auditoria.mapper";
import { auditoriaRepository } from "@/modules/auditoria/repository/auditoria.repository";
import type { AuditPayload } from "@/modules/auditoria/types/auditoria.types";

export class AuditoriaService {
  async record(payload: AuditPayload) {
    const event = await auditoriaRepository.create(payload);
    return toAuditEventResponse(event);
  }

  async list(query: AuditoriaQuery) {
    const events = await auditoriaRepository.list(query);
    return events.map(toAuditEventResponse);
  }
}

export const auditoriaService = new AuditoriaService();
