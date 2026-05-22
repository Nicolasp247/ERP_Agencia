/* erp-tour-operator/frontend/src/routes/AppRouter.tsx */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Protected } from "@/components/Protected";
import { AgenteDetailPage } from "@/pages/AgenteDetailPage";
import { AgenteFormPage } from "@/pages/AgenteFormPage";
import { AgentesListPage } from "@/pages/AgentesListPage";
import { ClienteDetailPage } from "@/pages/ClienteDetailPage";
import { ClienteFormPage } from "@/pages/ClienteFormPage";
import { ClientesListPage } from "@/pages/ClientesListPage";
import { CotizacionDetailPage } from "@/pages/CotizacionDetailPage";
import { CotizacionFormPage } from "@/pages/CotizacionFormPage";
import { CotizacionesListPage } from "@/pages/CotizacionesListPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProveedorDetailPage } from "@/pages/ProveedorDetailPage";
import { ProveedorFormPage } from "@/pages/ProveedorFormPage";
import { ProveedoresListPage } from "@/pages/ProveedoresListPage";
import { ReportesPage } from "@/pages/ReportesPage";
import { ReservaDetailPage } from "@/pages/ReservaDetailPage";
import { ReservasListPage } from "@/pages/ReservasListPage";
import { ServicioDetailPage } from "@/pages/ServicioDetailPage";
import { ServicioFormPage } from "@/pages/ServicioFormPage";
import { ServiciosListPage } from "@/pages/ServiciosListPage";
import { TarifasPage } from "@/pages/TarifasPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<Navigate replace to="/reportes" />} path="/" />
        <Route element={<Protected><ReportesPage /></Protected>} path="/reportes" />
        <Route element={<Protected><AgentesListPage /></Protected>} path="/agentes" />
        <Route element={<Protected><AgenteFormPage /></Protected>} path="/agentes/new" />
        <Route element={<Protected><AgenteFormPage /></Protected>} path="/agentes/:id/edit" />
        <Route element={<Protected><AgenteDetailPage /></Protected>} path="/agentes/:id" />
        <Route element={<Protected><ClientesListPage /></Protected>} path="/clientes" />
        <Route element={<Protected><ClienteFormPage /></Protected>} path="/clientes/new" />
        <Route element={<Protected><ClienteFormPage /></Protected>} path="/clientes/:id/edit" />
        <Route element={<Protected><ClienteDetailPage /></Protected>} path="/clientes/:id" />
        <Route element={<Protected><ProveedoresListPage /></Protected>} path="/proveedores" />
        <Route element={<Protected><ProveedorFormPage /></Protected>} path="/proveedores/new" />
        <Route element={<Protected><ProveedorFormPage /></Protected>} path="/proveedores/:id/edit" />
        <Route element={<Protected><ProveedorDetailPage /></Protected>} path="/proveedores/:id" />
        <Route element={<Protected><ServiciosListPage /></Protected>} path="/servicios" />
        <Route element={<Protected><ServicioFormPage /></Protected>} path="/servicios/new" />
        <Route element={<Protected><ServicioFormPage /></Protected>} path="/servicios/:id/edit" />
        <Route element={<Protected><ServicioDetailPage /></Protected>} path="/servicios/:id" />
        <Route element={<Protected><TarifasPage /></Protected>} path="/tarifas" />
        <Route element={<Protected><CotizacionesListPage /></Protected>} path="/cotizaciones" />
        <Route element={<Protected><CotizacionFormPage /></Protected>} path="/cotizaciones/new" />
        <Route element={<Protected><CotizacionFormPage /></Protected>} path="/cotizaciones/:id/edit" />
        <Route element={<Protected><CotizacionDetailPage /></Protected>} path="/cotizaciones/:id" />
        <Route element={<Protected><ReservasListPage /></Protected>} path="/reservas" />
        <Route element={<Protected><ReservaDetailPage /></Protected>} path="/reservas/:id" />
        <Route
          element={
            <Protected>
              <div className="empty-state-panel">Pantalla en construcción.</div>
            </Protected>
          }
          path="*"
        />
      </Routes>
    </BrowserRouter>
  );
}
