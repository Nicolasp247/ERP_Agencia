import { prisma } from "@/core/db/prisma";
import { auditoriaService } from "@/modules/auditoria/service/auditoria.service";
import { servicioRepository } from "@/modules/servicio/repository/servicio.repository";
import { servicioService } from "@/modules/servicio/service/servicio.service";

describe("services smoke", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("crea un servicio con bloque especifico de tour", async () => {
    vi.spyOn(servicioRepository, "findByNombre").mockResolvedValue(null as never);
    vi.spyOn(servicioRepository, "findTipoById").mockResolvedValue({
      id: 4,
      codigo: "EXCURSION",
      activo: true
    } as never);
    vi.spyOn(prisma.proveedor, "findUnique").mockResolvedValue({
      id: 5,
      activo: true
    } as never);
    vi.spyOn(prisma.ciudad, "findUnique").mockResolvedValue({
      id: 18
    } as never);
    vi.spyOn(servicioRepository, "create").mockResolvedValue({ id: 9 } as never);
    vi.spyOn(servicioService, "getById").mockResolvedValue({ id: 9 } as never);
    vi.spyOn(auditoriaService, "record").mockResolvedValue({ id: 1 } as never);

    const result = await servicioService.create(
      {
        idTipo: 4,
        idProveedor: 5,
        idCiudad: 18,
        nombreWtravel: "Excursion Toledo",
        tiempoServicio: "11h",
        privado: false,
        descripcion: "Demo",
        linkReserva: null,
        activo: true,
        tour: {
          tipoGuia: "GUIA",
          idioma: "Español"
        }
      },
      1
    );

    expect(servicioRepository.create).toHaveBeenCalled();
    expect(result.id).toBe(9);
  });
});
