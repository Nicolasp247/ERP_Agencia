import { Router } from "express";
import { geoController } from "./controller/geo.controller";

export const geoRouter = Router();

geoRouter.get("/continentes", geoController.getContinentes);
geoRouter.get("/paises", geoController.getPaises);
geoRouter.get("/ciudades", geoController.getCiudades);