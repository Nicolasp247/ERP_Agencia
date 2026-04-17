import type { NextFunction, Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

import { AppError } from "@/core/errors/app-error";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null
      }
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Error de validación",
        details: error.flatten()
      }
    });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    return res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: "Error de persistencia",
        details: error.meta ?? null
      }
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Ha ocurrido un error interno"
    }
  });
}
