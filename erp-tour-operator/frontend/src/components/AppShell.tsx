/* erp-tour-operator/frontend/src/components/AppShell.tsx */

import { useState, type PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

import { useAuthStore } from "@/modules/auth/auth-store";

const links = [
  { to: "/agentes", label: "Agentes" },
  { to: "/clientes", label: "Clientes" },
  { to: "/proveedores", label: "Proveedores" },
  { to: "/servicios", label: "Servicios" },
  { to: "/tarifas", label: "Tarifas" },
  { to: "/expedientes", label: "Expedientes" },
  { to: "/reservas", label: "Reservas" },
  { to: "/reportes", label: "Reportes" }
];

export function AppShell({ children }: PropsWithChildren) {
  const { user, clearSession } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={sidebarCollapsed ? "app-shell app-shell-collapsed" : "app-shell"}>
      <aside className={sidebarCollapsed ? "sidebar sidebar-collapsed" : "sidebar"}>
        <div className="sidebar-top">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((current) => !current)}
            title={sidebarCollapsed ? "Mostrar panel" : "Ocultar panel"}
            type="button"
          >
            {sidebarCollapsed ? "☰" : "‹"}
          </button>

          {!sidebarCollapsed ? (
            <div>
              <p className="eyebrow">ERP TOUR OPERATOR</p>
              <h1>Panel operativo</h1>
              <p className="muted">Mayorista de turismo. MVP funcional sobre D1-D5.</p>
            </div>
          ) : null}
        </div>

        <nav className="nav">
          {links.map((link) => (
            <NavLink
              className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
              key={link.to}
              title={sidebarCollapsed ? link.label : undefined}
              to={link.to}
            >
              {sidebarCollapsed ? link.label.slice(0, 1) : link.label}
            </NavLink>
          ))}
        </nav>

        {!sidebarCollapsed ? (
          <div className="sidebar-footer">
            <p className="muted">{user?.nombre}</p>
            <button className="ghost-button" onClick={clearSession} type="button">
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="sidebar-footer sidebar-footer-collapsed">
            <button className="ghost-button" onClick={clearSession} title="Cerrar sesión" type="button">
              ⏻
            </button>
          </div>
        )}
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}