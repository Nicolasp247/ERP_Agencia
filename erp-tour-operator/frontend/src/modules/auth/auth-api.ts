import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    roles: string[];
  };
};

export async function login(payload: LoginPayload) {
  const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return response.data.data;
}

export async function fetchCurrentUser() {
  const response = await api.get<ApiResponse<LoginResponse["user"]>>("/auth/me");
  return response.data.data;
}
