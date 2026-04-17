import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

import { useAuthStore } from "@/modules/auth/auth-store";

const links = [
  { to: "/agentes", label: "Agentes" },
  { to: "/clientes", label: "Clientes" },
  { to: "/proveedores", label: "Proveedores" },
  { to: "/servicios", label: "Servicios" },
  { to: "/tarifas", label: "Tarifas" },
  { to: "/cotizaciones", label: "Cotizaciones" },
  { to: "/reservas", label: "Reservas" },
  { to: "/reportes", label: "Reportes" }
];

export function AppShell({ children }: PropsWithChildren) {
  const { user, clearSession } = useAuthStore();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">ERP TOUR OPERATOR</p>
          <h1>Panel operativo</h1>
          <p className="muted">Mayorista de turismo. MVP funcional sobre D1-D5.</p>
        </div>

        <nav className="nav">
          {links.map((link) => (
            <NavLink
              className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
              key={link.to}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="muted">{user?.nombre}</p>
          <button className="ghost-button" onClick={clearSession} type="button">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
