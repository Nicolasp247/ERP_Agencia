import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject, ZodTypeAny } from "zod";

/**
 * Extiende el objeto Request con propiedades nuevas
 * para guardar los datos ya validados sin tocar directamente
 * req.query ni req.params.
 */
type ValidatedRequest = Request & {
  validatedBody?: unknown;
  validatedParams?: unknown;
  validatedQuery?: unknown;
};

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.body);
    (req as ValidatedRequest).validatedBody = parsed;
    next();
  };
}

export function validateParams(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.params);
    (req as ValidatedRequest).validatedParams = parsed;
    next();
  };
}

export function validateQuery(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.query);
    (req as ValidatedRequest).validatedQuery = parsed;
    next();
  };
}