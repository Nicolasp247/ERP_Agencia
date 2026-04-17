import bcrypt from "bcryptjs";

import { authRepository } from "@/modules/auth/repository/auth.repository";
import { authService } from "@/modules/auth/service/auth.service";

describe("auth smoke", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("permite iniciar sesion con credenciales validas", async () => {
    const passwordHash = await bcrypt.hash("admin123", 10);

    vi.spyOn(authRepository, "findUserByEmail").mockResolvedValue({
      id: 1,
      nombre: "Admin",
      email: "admin@erp.local",
      passwordHash,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ rol: { codigo: "ADMIN", nombre: "Administrador" } }]
    } as never);

    const result = await authService.login({
      email: "admin@erp.local",
      password: "admin123"
    });

    expect(result.token).toBeTypeOf("string");
    expect(result.user.roles).toContain("ADMIN");
  });
});
