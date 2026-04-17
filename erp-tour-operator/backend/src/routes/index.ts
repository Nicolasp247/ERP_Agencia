import { Router } from "express";

import { prisma } from "@/core/db/prisma";
import { auditoriaRouter } from "@/modules/auditoria";
import { authRouter } from "@/modules/auth";
import { clienteRouter } from "@/modules/cliente";
import { clienteAgenteRouter } from "@/modules/cliente-agente";
import { cotizacionRouter } from "@/modules/cotizacion";
import { documentoRouter } from "@/modules/documento";
import { liquidacionRouter } from "@/modules/liquidacion";
import { proveedorRouter } from "@/modules/proveedor";
import { reservaRouter } from "@/modules/reserva";
import { reportesRouter } from "@/modules/reportes";
import { servicioRouter } from "@/modules/servicio";
import { tarifaRouter } from "@/modules/tarifa";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok"
    }
  });
});

apiRouter.get("/catalogos/continentes", async (_req, res) => {
  const data = await prisma.continente.findMany({
    orderBy: {
      nombre: "asc"
    }
  });

  res.json({
    success: true,
    data
  });
});

apiRouter.get("/catalogos/paises", async (_req, res) => {
  const data = await prisma.pais.findMany({
    orderBy: {
      nombre: "asc"
    }
  });

  res.json({
    success: true,
    data
  });
});

apiRouter.get("/catalogos/ciudades", async (req, res) => {
  const idPais = req.query.idPais ? Number(req.query.idPais) : undefined;
  const data = await prisma.ciudad.findMany({
    where: {
      idPais
    },
    orderBy: {
      nombre: "asc"
    }
  });

  res.json({
    success: true,
    data
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/auditoria", auditoriaRouter);
apiRouter.use("/cliente-agente", clienteAgenteRouter);
apiRouter.use("/cliente", clienteRouter);
apiRouter.use("/cotizacion", cotizacionRouter);
apiRouter.use("/documento", documentoRouter);
apiRouter.use("/liquidacion", liquidacionRouter);
apiRouter.use("/proveedor", proveedorRouter);
apiRouter.use("/reserva", reservaRouter);
apiRouter.use("/reportes", reportesRouter);
apiRouter.use("/servicio", servicioRouter);
apiRouter.use("/tarifa", tarifaRouter);
