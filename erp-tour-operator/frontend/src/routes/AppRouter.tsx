/* erp-tour-operator/frontend/src/routes/AppRouter.tsx */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Protected } from "@/components/Protected";
import { AgenteDetailPage } from "@/pages/agentes/AgenteDetailPage";
import { AgenteFormPage } from "@/pages/agentes/AgenteFormPage";
import { AgentesListPage } from "@/pages/agentes/AgentesListPage";
import { CotizacionBuilderPage } from "@/pages/expediente/cotizacion-builder/CotizacionBuilderPage";
import { ClienteDetailPage } from "@/pages/ClienteDetailPage";
import { ClienteFormPage } from "@/pages/ClienteFormPage";
import { ClientesListPage } from "@/pages/ClientesListPage";
import { ExpedienteDetailPage } from "@/pages/expediente/ExpedienteDetailPage";
import { ExpedienteFormPage } from "@/pages/expediente/ExpedienteFormPage";
import { ExpedientesListPage } from "@/pages/expediente/ExpedientesListPage";
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
import { TarifasPage } from "@/pages/tarifa/TarifasPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="/login" />

        <Route element={<Navigate replace to="/reportes" />} path="/" />

        <Route
          element={
            <Protected>
              <ReportesPage />
            </Protected>
          }
          path="/reportes"
        />

        <Route
          element={
            <Protected>
              <AgentesListPage />
            </Protected>
          }
          path="/agentes"
        />
        <Route
          element={
            <Protected>
              <AgenteFormPage />
            </Protected>
          }
          path="/agentes/new"
        />
        <Route
          element={
            <Protected>
              <AgenteFormPage />
            </Protected>
          }
          path="/agentes/:id/edit"
        />
        <Route
          element={
            <Protected>
              <AgenteDetailPage />
            </Protected>
          }
          path="/agentes/:id"
        />

        <Route
          element={
            <Protected>
              <ClientesListPage />
            </Protected>
          }
          path="/clientes"
        />
        <Route
          element={
            <Protected>
              <ClienteFormPage />
            </Protected>
          }
          path="/clientes/new"
        />
        <Route
          element={
            <Protected>
              <ClienteFormPage />
            </Protected>
          }
          path="/clientes/:id/edit"
        />
        <Route
          element={
            <Protected>
              <ClienteDetailPage />
            </Protected>
          }
          path="/clientes/:id"
        />

        <Route
          element={
            <Protected>
              <ProveedoresListPage />
            </Protected>
          }
          path="/proveedores"
        />
        <Route
          element={
            <Protected>
              <ProveedorFormPage />
            </Protected>
          }
          path="/proveedores/new"
        />
        <Route
          element={
            <Protected>
              <ProveedorFormPage />
            </Protected>
          }
          path="/proveedores/:id/edit"
        />
        <Route
          element={
            <Protected>
              <ProveedorDetailPage />
            </Protected>
          }
          path="/proveedores/:id"
        />

        <Route
          element={
            <Protected>
              <ServiciosListPage />
            </Protected>
          }
          path="/servicios"
        />
        <Route
          element={
            <Protected>
              <ServicioFormPage />
            </Protected>
          }
          path="/servicios/new"
        />
        <Route
          element={
            <Protected>
              <ServicioFormPage />
            </Protected>
          }
          path="/servicios/:id/edit"
        />
        <Route
          element={
            <Protected>
              <ServicioDetailPage />
            </Protected>
          }
          path="/servicios/:id"
        />

        <Route
          element={
            <Protected>
              <TarifasPage />
            </Protected>
          }
          path="/tarifas"
        />

        {/* Rutas nuevas con nombre correcto: Expedientes */}
        <Route path="/expedientes" element={<Protected><ExpedientesListPage /></Protected>} />
        <Route path="/expedientes/new" element={<Protected><ExpedienteFormPage /></Protected>} />
        <Route path="/expedientes/:id/edit" element={<Protected><ExpedienteFormPage /></Protected>} />
        <Route path="/expedientes/:id" element={<Protected><ExpedienteDetailPage /></Protected>} />
        <Route
          path="/expedientes/:id/versiones/:versionId/construir"
          element={<Protected><CotizacionBuilderPage /></Protected>}
        />

        <Route
          element={
            <Protected>
              <ReservasListPage />
            </Protected>
          }
          path="/reservas"
        />
        <Route
          element={
            <Protected>
              <ReservaDetailPage />
            </Protected>
          }
          path="/reservas/:id"
        />

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