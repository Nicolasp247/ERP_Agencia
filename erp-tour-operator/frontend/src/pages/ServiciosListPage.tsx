/* erp-tour-operator/frontend/src/pages/ServiciosListPage.tsx */

import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import { listTiposServicio, listServicios } from "@/modules/servicio/servicio-api";
import { buildServicioCotizacionPreview } from "@/modules/servicio/servicio-preview";

function normalizarTexto(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getPuntoNombre(value: any) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.nombre ?? null;
}

function buildPreviewServicio(servicio: any) {
  const detalle = servicio.detalleTipo ?? {};

  const origenNombre = getPuntoNombre(detalle?.origenNombre ?? detalle?.origen);
  const destinoNombre = getPuntoNombre(detalle?.destinoNombre ?? detalle?.destino);

  return buildServicioCotizacionPreview({
    tipoCodigo: servicio.tipoCodigo,
    nombreWtravel: servicio.nombreWtravel,
    tiempoServicio: servicio.tiempoServicio,
    privado: servicio.privado,
    tipoGuiaNombre: detalle?.tipoGuiaNombre,
    idiomaNombre: detalle?.idiomaNombre,
    origenNombre,
    destinoNombre,
    vueloOrigen: detalle?.origen,
    vueloDestino: detalle?.destino,
    vueloEscalas: detalle?.escalas,
    vueloClase: detalle?.clase,
    vueloEquipaje: detalle?.equipaje,
    trenOrigen: detalle?.origen,
    trenDestino: detalle?.destino,
    trenEscalas: detalle?.escalas,
    trenClase: detalle?.clase,
    trenSillasReservadas: detalle?.sillasReservadas
  });
}

function ordenarPorNombre(items: Array<any>, key: string) {
  return [...items].sort((a, b) =>
    String(a?.[key] ?? "").localeCompare(String(b?.[key] ?? ""), "es", {
      sensitivity: "base"
    })
  );
}

export function ServiciosListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const idContinente = searchParams.get("idContinente")
    ? Number(searchParams.get("idContinente"))
    : undefined;

  const idPais = searchParams.get("idPais") ? Number(searchParams.get("idPais")) : undefined;
  const idCiudad = searchParams.get("idCiudad") ? Number(searchParams.get("idCiudad")) : undefined;
  const idTipo = searchParams.get("idTipo") ? Number(searchParams.get("idTipo")) : undefined;

  const busqueda = searchParams.get("q") ?? "";
  const proveedorFiltro = searchParams.get("proveedor") ?? "";
  const estadoFiltro = searchParams.get("estado") ?? "";
  const tarifaFiltro = searchParams.get("tarifa") ?? "";

  const continentesQuery = useQuery({
    queryKey: ["continentes"],
    queryFn: fetchContinentes
  });

  const paisesQuery = useQuery({
    queryKey: ["paises", idContinente],
    queryFn: () => fetchPaises(idContinente),
    enabled: Boolean(idContinente)
  });

  const ciudadesQuery = useQuery({
    queryKey: ["ciudades", idPais],
    queryFn: () => fetchCiudades(idPais),
    enabled: Boolean(idPais)
  });

  const tiposQuery = useQuery({
    queryKey: ["tipos-servicio"],
    queryFn: listTiposServicio
  });

  const serviciosQuery = useQuery({
    queryKey: ["servicios", { idContinente, idPais, idCiudad, idTipo }],
    queryFn: () =>
      listServicios({
        idContinente,
        idPais,
        idCiudad,
        idTipo
      })
  });

  const servicios = (serviciosQuery.data ?? []) as Array<any>;

  const proveedoresDisponibles = ordenarPorNombre(
    Array.from(
      new Map(
        servicios
          .filter((servicio) => servicio.proveedor)
          .map((servicio) => [
            servicio.proveedor,
            {
              nombre: servicio.proveedor
            }
          ])
      ).values()
    ),
    "nombre"
  );

  const serviciosConPreview = servicios.map((servicio) => {
    const preview = buildPreviewServicio(servicio);

    return {
      ...servicio,
      preview
    };
  });

  const serviciosFiltrados = serviciosConPreview.filter((servicio) => {
    const textoBusqueda = normalizarTexto(busqueda);

    const coincideBusqueda =
      !textoBusqueda ||
      [
        servicio.preview,
        servicio.nombreWtravel,
        servicio.tipo,
        servicio.proveedor,
        servicio.ciudad,
        servicio.pais
      ]
        .map(normalizarTexto)
        .some((value) => value.includes(textoBusqueda));

    const coincideProveedor =
      !proveedorFiltro || servicio.proveedor === proveedorFiltro;

    const coincideEstado =
      !estadoFiltro ||
      (estadoFiltro === "activo" && servicio.activo) ||
      (estadoFiltro === "inactivo" && !servicio.activo);

    const tieneTarifa = Boolean(servicio.precioBase);

    const coincideTarifa =
      !tarifaFiltro ||
      (tarifaFiltro === "con_tarifa" && tieneTarifa) ||
      (tarifaFiltro === "sin_tarifa" && !tieneTarifa);

    return coincideBusqueda && coincideProveedor && coincideEstado && coincideTarifa;
  });

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    if (key === "idContinente") {
      next.delete("idPais");
      next.delete("idCiudad");
    }

    if (key === "idPais") {
      next.delete("idCiudad");
    }

    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <PageSection
      action={
        <Link className="primary-button" to="/servicios/new">
          Nuevo servicio
        </Link>
      }
      title="Servicios turísticos"
    >
      <div className="services-filter-panel">
        <label className="services-search-field">
          Buscar servicio
          <input
            value={busqueda}
            onChange={(e) => updateFilter("q", e.target.value)}
            placeholder="Buscar por nombre, preview, ciudad, proveedor..."
          />
        </label>

        <div className="services-filter-grid">
          <label>
            Continente
            <select
              value={idContinente ?? ""}
              onChange={(e) => updateFilter("idContinente", e.target.value)}
            >
              <option value="">Todos</option>
              {(continentesQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            País
            <select value={idPais ?? ""} onChange={(e) => updateFilter("idPais", e.target.value)}>
              <option value="">Todos</option>
              {(paisesQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ciudad
            <select
              value={idCiudad ?? ""}
              onChange={(e) => updateFilter("idCiudad", e.target.value)}
            >
              <option value="">Todas</option>
              {(ciudadesQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo de servicio
            <select value={idTipo ?? ""} onChange={(e) => updateFilter("idTipo", e.target.value)}>
              <option value="">Todos</option>
              {(tiposQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="services-filter-grid services-filter-grid-secondary">
          <label>
            Proveedor
            <select
              value={proveedorFiltro}
              onChange={(e) => updateFilter("proveedor", e.target.value)}
            >
              <option value="">Todos</option>
              {proveedoresDisponibles.map((proveedor) => (
                <option key={proveedor.nombre} value={proveedor.nombre}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Estado
            <select value={estadoFiltro} onChange={(e) => updateFilter("estado", e.target.value)}>
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </label>

          <label>
            Tarifa
            <select value={tarifaFiltro} onChange={(e) => updateFilter("tarifa", e.target.value)}>
              <option value="">Todas</option>
              <option value="con_tarifa">Con tarifa</option>
              <option value="sin_tarifa">Sin tarifa</option>
            </select>
          </label>

          <div className="services-filter-actions">
            <button className="link-button" type="button" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="services-list-summary">
        <span>
          Mostrando <strong>{serviciosFiltrados.length}</strong> de{" "}
          <strong>{servicios.length}</strong> servicios
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Servicio / Preview</th>
            <th>Tipo</th>
            <th>Proveedor</th>
            <th>Ciudad</th>
            <th>Tarifa base</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {serviciosFiltrados.map((servicio) => (
            <tr key={servicio.id}>
              <td>
                <strong>{servicio.preview}</strong>
                {servicio.preview !== servicio.nombreWtravel ? (
                  <p className="table-subtext">Interno: {servicio.nombreWtravel}</p>
                ) : null}
              </td>

              <td>
                <span className="status-chip status-chip-neutral">{servicio.tipo}</span>
              </td>

              <td>{servicio.proveedor}</td>
              <td>{servicio.ciudad}</td>

              <td>
                {servicio.precioBase
                  ? `Desde ${servicio.precioBase} ${servicio.monedaCodigo ?? ""}`
                  : "Sin tarifa"}
              </td>

              <td>
                <span
                  className={
                    servicio.activo
                      ? "status-chip status-chip-active"
                      : "status-chip status-chip-inactive"
                  }
                >
                  {servicio.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <Link className="link-button" to={`/servicios/${servicio.id}`}>
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!serviciosFiltrados.length ? (
        <div className="services-empty-state">
          No hay servicios que coincidan con los filtros seleccionados.
        </div>
      ) : null}
    </PageSection>
  );
}