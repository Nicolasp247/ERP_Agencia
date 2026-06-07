/* erp-tour-operator/backend/src/core/utils/request-user.ts */

import type { Request } from "express";

type AuthenticatedRequest = Request & {
  user?: {
    id?: number;
  };
};

export function getRequestUserId(req: Request): number | undefined {
  return (req as AuthenticatedRequest).user?.id;
}