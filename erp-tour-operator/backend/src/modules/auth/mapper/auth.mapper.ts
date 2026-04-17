import type { Usuario } from "@prisma/client";

import type { AuthenticatedUser } from "@/modules/auth/types/auth.types";

type UserWithRoles = Usuario & {
  roles: Array<{
    rol: {
      codigo: string;
      nombre: string;
    };
  }>;
};

export function toAuthenticatedUser(user: UserWithRoles): AuthenticatedUser {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    roles: user.roles.map((item) => item.rol.codigo)
  };
}
