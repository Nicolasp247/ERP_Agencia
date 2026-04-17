import { prisma } from "@/core/db/prisma";

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });
  }

  findUserById(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });
  }

  listUsers() {
    return prisma.usuario.findMany({
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      },
      orderBy: {
        nombre: "asc"
      }
    });
  }

  listRoles() {
    return prisma.rol.findMany({
      orderBy: {
        nombre: "asc"
      }
    });
  }

  async createUser(data: {
    nombre: string;
    email: string;
    passwordHash: string;
    roleCodes: string[];
  }) {
    return prisma.$transaction(async (tx) => {
      const roles = await tx.rol.findMany({
        where: {
          codigo: {
            in: data.roleCodes
          }
        }
      });

      const user = await tx.usuario.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          passwordHash: data.passwordHash
        }
      });

      await tx.usuarioRol.createMany({
        data: roles.map((role) => ({
          idUsuario: user.id,
          idRol: role.id
        }))
      });

      return tx.usuario.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              rol: true
            }
          }
        }
      });
    });
  }

  async updateUserRoles(userId: number, roleCodes: string[]) {
    return prisma.$transaction(async (tx) => {
      const roles = await tx.rol.findMany({
        where: {
          codigo: {
            in: roleCodes
          }
        }
      });

      await tx.usuarioRol.deleteMany({
        where: {
          idUsuario: userId
        }
      });

      await tx.usuarioRol.createMany({
        data: roles.map((role) => ({
          idUsuario: userId,
          idRol: role.id
        }))
      });

      return tx.usuario.findUniqueOrThrow({
        where: { id: userId },
        include: {
          roles: {
            include: {
              rol: true
            }
          }
        }
      });
    });
  }
}

export const authRepository = new AuthRepository();
