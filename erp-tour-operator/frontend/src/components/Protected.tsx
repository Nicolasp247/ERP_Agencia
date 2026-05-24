/* erp-tour-operator/frontend/src/components/Protected.tsx */

import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { useAuthStore } from "@/modules/auth/auth-store";

export function Protected({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate replace to="/login" />;
  }

  return <AppShell>{children}</AppShell>;
}
