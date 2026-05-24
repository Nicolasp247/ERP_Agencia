/* erp-tour-operator/backend/src/routes/index.ts */

import { Router } from "express";

import { auditoriaRouter } from "@/modules/auditoria";
import { authRouter } from "@/modules/auth";
import { clienteRouter } from "@/modules/cliente";
import { clienteAgenteRouter } from "@/modules/cliente-agente";
import { cotizacionRouter } from "@/modules/cotizacion";
import { cotizacionBuilderRouter } from "@/modules/cotizacion-builder";
import { documentoRouter } from "@/modules/documento";
import { geoRouter } from "@/modules/geo";
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

apiRouter.use("/auth", authRouter);
apiRouter.use("/auditoria", auditoriaRouter);
apiRouter.use("/cliente-agente", clienteAgenteRouter);
apiRouter.use("/cliente", clienteRouter);
apiRouter.use("/cotizacion", cotizacionRouter);
apiRouter.use("/cotizacion-builder", cotizacionBuilderRouter);
apiRouter.use("/documento", documentoRouter);
apiRouter.use("/geo", geoRouter);
apiRouter.use("/liquidacion", liquidacionRouter);
apiRouter.use("/proveedor", proveedorRouter);
apiRouter.use("/reserva", reservaRouter);
apiRouter.use("/reportes", reportesRouter);
apiRouter.use("/servicio", servicioRouter);
apiRouter.use("/tarifa", tarifaRouter);