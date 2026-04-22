import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import { listTiposServicio, listServicios } from "@/modules/servicio/servicio-api";

export function ServiciosListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const idContinente = searchParams.get("idContinente")
    ? Number(searchParams.get("idContinente"))
    : undefined;

  const idPais = searchParams.get("idPais") ? Number(searchParams.get("idPais")) : undefined;
  const idCiudad = searchParams.get("idCiudad") ? Number(searchParams.get("idCiudad")) : undefined;
  const idTipo = searchParams.get("idTipo") ? Number(searchParams.get("idTipo")) : undefined;

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

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    // Si cambia continente, limpiamos país y ciudad
    if (key === "idContinente") {
      next.delete("idPais");
      next.delete("idCiudad");
    }

    // Si cambia país, limpiamos ciudad
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "1rem",
          marginBottom: "1rem"
        }}
      >
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
          <select value={idCiudad ?? ""} onChange={(e) => updateFilter("idCiudad", e.target.value)}>
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

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="link-button" type="button" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Tipo</th>
            <th>Proveedor</th>
            <th>Ciudad</th>
            <th>Precio base</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {servicios.map((servicio) => (
            <tr key={servicio.id}>
              <td>{servicio.nombreWtravel}</td>
              <td>{servicio.tipo}</td>
              <td>{servicio.proveedor}</td>
              <td>{servicio.ciudad}</td>
              <td>
                {servicio.precioBase ?? "Sin tarifa"} {servicio.monedaCodigo ?? ""}
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
    </PageSection>
  );
}