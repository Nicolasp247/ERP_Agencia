import { prisma } from "@/core/db/prisma";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import { clienteRepository } from "@/modules/cliente/repository/cliente.repository";
import { clienteService } from "@/modules/cliente/service/cliente.service";

describe("third parties smoke", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("crea un cliente asociado a una agencia activa", async () => {
    vi.spyOn(prisma.clienteAgente, "findUnique").mockResolvedValue({
      id: 2,
      activo: true
    } as never);
    vi.spyOn(clienteRepository, "create").mockResolvedValue({ id: 33 } as never);
    vi.spyOn(clienteService, "getById").mockResolvedValue({
      id: 33,
      nombreCompleto: "Pasajero Demo"
    } as never);
    vi.spyOn(auditoriaService, "record").mockResolvedValue({ id: 1 } as never);

    const result = await clienteService.create(
      {
        idClienteAgente: 2,
        nombreCompleto: "Pasajero Demo",
        telefono: null,
        email: null,
        idPais: null,
        idCiudad: null,
        observaciones: null,
        activo: true
      },
      1
    );

    expect(clienteRepository.create).toHaveBeenCalled();
    expect(result.id).toBe(33);
  });
});
