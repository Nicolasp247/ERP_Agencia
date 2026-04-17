import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "@/core/config/env";
import { AppError } from "@/core/errors/app-error";

type JwtPayload = {
  sub: string;
  email: string;
  roles: string[];
};

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "Token no proporcionado"));
  }

  try {
    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      roles: payload.roles
    };

    return next();
  } catch (error) {
    return next(new AppError(401, "INVALID_TOKEN", "Token inválido", error));
  }
}

export function requireRoles(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles ?? [];
    const allowed = roles.some((role) => userRoles.includes(role));

    if (!allowed) {
      return next(new AppError(403, "FORBIDDEN", "No tiene permisos suficientes"));
    }

    return next();
  };
}
