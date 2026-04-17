import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";

import { login } from "@/modules/auth/auth-api";
import { loginFormSchema, type LoginFormValues } from "@/modules/auth/auth-schema";
import { useAuthStore } from "@/modules/auth/auth-store";

export function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "admin@erp.local",
      password: "admin123"
    }
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session);
    }
  });

  if (token) {
    return <Navigate replace to="/reportes" />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">ERP TOUR OPERATOR</p>
        <h1>Acceso operativo</h1>
        <p className="muted">Usuario inicial: `admin@erp.local` / `admin123`.</p>

        <form className="form-grid" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <label>
            Email
            <input {...register("email")} type="email" />
            <span className="field-error">{errors.email?.message}</span>
          </label>
          <label>
            Contraseña
            <input {...register("password")} type="password" />
            <span className="field-error">{errors.password?.message}</span>
          </label>

          <button className="primary-button" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Entrando..." : "Entrar"}
          </button>
          {mutation.isError ? <p className="field-error">No fue posible iniciar sesión.</p> : null}
        </form>
      </div>
    </div>
  );
}
