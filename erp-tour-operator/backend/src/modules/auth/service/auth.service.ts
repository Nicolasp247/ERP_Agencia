import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "@/core/config/env";
import { AppError } from "@/core/errors/app-error";
import { toAuthenticatedUser } from "@/modules/auth/mapper/auth.mapper";
import { authRepository } from "@/modules/auth/repository/auth.repository";
import type { CreateUserInput, LoginInput, UpdateUserRolesInput } from "@/modules/auth/dto/auth.dto";

export class AuthService {
  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user || !user.activo) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Credenciales inválidas");
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!validPassword) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Credenciales inválidas");
    }

    const payload = toAuthenticatedUser(user);

    const token = jwt.sign(
      {
        email: payload.email,
        roles: payload.roles
      },
      env.JWT_SECRET as jwt.Secret,
      {
        subject: String(payload.id),
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
      }
    );

    return {
      token,
      user: payload
    };
  }

  async me(userId: number) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "Usuario no encontrado");
    }

    return toAuthenticatedUser(user);
  }

  async listUsers() {
    const users = await authRepository.listUsers();
    return users.map(toAuthenticatedUser);
  }

  listRoles() {
    return authRepository.listRoles();
  }

  async createUser(input: CreateUserInput) {
    const existing = await authRepository.findUserByEmail(input.email);

    if (existing) {
      throw new AppError(409, "USER_ALREADY_EXISTS", "Ya existe un usuario con ese email");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await authRepository.createUser({
      ...input,
      passwordHash
    });

    return toAuthenticatedUser(user);
  }

  async updateUserRoles(userId: number, input: UpdateUserRolesInput) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "Usuario no encontrado");
    }

    const updated = await authRepository.updateUserRoles(userId, input.roleCodes);
    return toAuthenticatedUser(updated);
  }
}

export const authService = new AuthService();
