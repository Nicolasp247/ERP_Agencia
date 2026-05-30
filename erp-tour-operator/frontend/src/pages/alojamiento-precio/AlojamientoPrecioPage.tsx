/* erp-tour-operator/frontend/src/pages/alojamiento-precio/AlojamientoPrecioPage.tsx */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { PageSection } from "@/components/PageSection";
import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import {
  alojamientoPrecioFormSchema,
  CATEGORIAS_HABITACION,
  CATEGORIAS_HOTEL,
  deleteAlojamientoPrecio,
  listAlojamientoPrecios,
  MESES,
  REGIMENES_ALOJAMIENTO,
  saveAlojamientoPrecio,
  TIPOS_HABITACION,
  updateAlojamientoPrecio,
  type AlojamientoPrecio,
  type AlojamientoPrecioFormValues
} from "@/modules/alojamiento-precio/alojamiento-precio-api";

function getCurrentYear() {
  return new Date().getFullYear();
}

function formatMoney(value: number | null, currency = "USD") {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toFixed(2)} ${currency}`;
}

function getDefaultValues(): AlojamientoPrecioFormValues {
  return {
    idCiudad: 0,
    categoria: "H3_ECONOMICO",
    categoriaHab: "ESTANDAR",
    regimen: "ALOJAMIENTO_DESAYUNO",
    anio: getCurrentYear(),
    mes: new Date().getMonth() + 1,
    tipoHabitacion: "DBL",
    precioUsd: 0,
    monedaCodigo: "USD",
    activo: true
  };
}

export function AlojamientoPrecioPage() {
  const [editingId, setEditingId] = useState<number | null>(null);

  const [idContinente, setIdContinente] = useState("");
  const [idPais, setIdPais] = useState("");
  const [idCiudadFiltro, setIdCiudadFiltro] = useState("");
  const [anioFiltro, setAnioFiltro] = useState(String(getCurrentYear()));
  const [mesFiltro, setMesFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const continentesQuery = useQuery({
    queryKey: ["continentes"],
    queryFn: fetchContinentes
  });

  const paisesQuery = useQuery({
    queryKey: ["paises", idContinente],
    queryFn: () => fetchPaises(idContinente ? Number(idContinente) : undefined),
    enabled: Boolean(idContinente)
  });

  const ciudadesQuery = useQuery({
    queryKey: ["ciudades", idPais],
    queryFn: () => fetchCiudades(idPais ? Number(idPais) : undefined),
    enabled: Boolean(idPais)
  });

  const preciosQuery = useQuery({
    queryKey: [
      "alojamiento-precios",
      {
        idCiudadFiltro,
        anioFiltro,
        mesFiltro,
        categoriaFiltro
      }
    ],
    queryFn: () =>
      listAlojamientoPrecios({
        idCiudad: idCiudadFiltro ? Number(idCiudadFiltro) : undefined,
        anio: anioFiltro ? Number(anioFiltro) : undefined,
        mes: mesFiltro ? Number(mesFiltro) : undefined,
        categoria: categoriaFiltro || undefined
      })
  });

  const form = useForm<AlojamientoPrecioFormValues>({
    resolver: zodResolver(alojamientoPrecioFormSchema),
    defaultValues: getDefaultValues()
  });

  const formIdCiudad = form.watch("idCiudad");

  const ciudadSeleccionada = useMemo(() => {
    return (ciudadesQuery.data ?? []).find((ciudad) => ciudad.id === Number(formIdCiudad));
  }, [ciudadesQuery.data, formIdCiudad]);

  const saveMutation = useMutation({
    mutationFn: (values: AlojamientoPrecioFormValues) => {
      if (editingId) {
        return updateAlojamientoPrecio(editingId, values);
      }

      return saveAlojamientoPrecio(values);
    },
    onSuccess: () => {
      setEditingId(null);
      form.reset(getDefaultValues());
      void preciosQuery.refetch();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlojamientoPrecio,
    onSuccess: () => {
      void preciosQuery.refetch();
    }
  });

  function resetLocationFilters() {
    setIdPais("");
    setIdCiudadFiltro("");
  }

  function startEdit(precio: AlojamientoPrecio) {
    setEditingId(precio.id);

    form.reset({
      idCiudad: precio.idCiudad,
      categoria: precio.categoria,
      categoriaHab: precio.categoriaHab,
      regimen: precio.regimen,
      anio: precio.anio,
      mes: precio.mes,
      tipoHabitacion: precio.tipoHabitacion,
      precioUsd: precio.precioUsd ?? 0,
      monedaCodigo: precio.monedaCodigo,
      activo: precio.activo
    });
  }

  function cancelEdit() {
    setEditingId(null);
    form.reset(getDefaultValues());
  }

  function confirmDelete(precio: AlojamientoPrecio) {
    const confirmed = window.confirm(
      `¿Eliminar precio ${precio.categoriaLabel} ${precio.tipoHabitacionLabel} de ${precio.ciudad}?`
    );

    if (confirmed) {
      deleteMutation.mutate(precio.id);
    }
  }

  return (
    <div className="stack">
      <PageSection
        title="Precios de alojamiento"
        subtitle="Carga precios por ciudad, categoría hotelera, habitación, régimen, mes y tipo de habitación."
      >
        <div className="services-filter-panel">
          <div className="services-filter-grid">
            <label>
              Continente
              <select
                value={idContinente}
                onChange={(event) => {
                  setIdContinente(event.target.value);
                  resetLocationFilters();
                }}
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
              <select
                value={idPais}
                onChange={(event) => {
                  setIdPais(event.target.value);
                  setIdCiudadFiltro("");
                }}
                disabled={!idContinente}
              >
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
                value={idCiudadFiltro}
                onChange={(event) => setIdCiudadFiltro(event.target.value)}
                disabled={!idPais}
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
              Año
              <input
                value={anioFiltro}
                onChange={(event) => setAnioFiltro(event.target.value)}
                type="number"
              />
            </label>
          </div>

          <div className="services-filter-grid services-filter-grid-secondary">
            <label>
              Mes
              <select value={mesFiltro} onChange={(event) => setMesFiltro(event.target.value)}>
                <option value="">Todos</option>
                {MESES.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Categoría hotelera
              <select
                value={categoriaFiltro}
                onChange={(event) => setCategoriaFiltro(event.target.value)}
              >
                <option value="">Todas</option>
                {CATEGORIAS_HOTEL.map((categoria) => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="services-filter-actions">
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setIdContinente("");
                  setIdPais("");
                  setIdCiudadFiltro("");
                  setAnioFiltro(String(getCurrentYear()));
                  setMesFiltro("");
                  setCategoriaFiltro("");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection title={editingId ? "Editar precio" : "Nuevo precio de alojamiento"}>
        <form
          className="form-grid"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          <div className="grid-3">
            <label>
              Ciudad
              <select {...form.register("idCiudad")}>
                <option value="">Selecciona</option>
                {(ciudadesQuery.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
              {ciudadSeleccionada ? (
                <small className="muted">Ciudad seleccionada: {ciudadSeleccionada.nombre}</small>
              ) : null}
            </label>

            <label>
              Categoría hotelera
              <select {...form.register("categoria")}>
                {CATEGORIAS_HOTEL.map((categoria) => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Categoría habitación
              <select {...form.register("categoriaHab")}>
                {CATEGORIAS_HABITACION.map((categoria) => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid-3">
            <label>
              Régimen
              <select {...form.register("regimen")}>
                {REGIMENES_ALOJAMIENTO.map((regimen) => (
                  <option key={regimen.value} value={regimen.value}>
                    {regimen.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Año
              <input {...form.register("anio")} type="number" />
            </label>

            <label>
              Mes
              <select {...form.register("mes")}>
                {MESES.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid-3">
            <label>
              Tipo habitación
              <select {...form.register("tipoHabitacion")}>
                {TIPOS_HABITACION.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Precio USD
              <input {...form.register("precioUsd")} type="number" step="0.01" />
            </label>

            <label>
              Estado
              <select {...form.register("activo")}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </label>
          </div>

          <div className="toolbar">
            <button className="primary-button" disabled={saveMutation.isPending} type="submit">
              {saveMutation.isPending
                ? "Guardando..."
                : editingId
                  ? "Guardar cambios"
                  : "Guardar precio"}
            </button>

            {editingId ? (
              <button className="link-button" onClick={cancelEdit} type="button">
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>
      </PageSection>

      <PageSection title="Precios registrados">
        {(preciosQuery.data ?? []).length ? (
          <table>
            <thead>
              <tr>
                <th>Ciudad</th>
                <th>Categoría hotelera</th>
                <th>Habitación</th>
                <th>Régimen</th>
                <th>Mes/Año</th>
                <th>Tipo habitación</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {(preciosQuery.data ?? []).map((precio) => (
                <tr key={precio.id}>
                  <td>
                    <strong>{precio.ciudad}</strong>
                    {precio.pais ? <p className="table-subtext">{precio.pais}</p> : null}
                  </td>

                  <td>{precio.categoriaLabel}</td>
                  <td>{precio.categoriaHabLabel}</td>
                  <td>{precio.regimenLabel}</td>
                  <td>
                    {precio.mesLabel} {precio.anio}
                  </td>
                  <td>{precio.tipoHabitacionLabel}</td>
                  <td>{formatMoney(precio.precioUsd, precio.monedaCodigo)}</td>

                  <td>
                    <span
                      className={
                        precio.activo
                          ? "status-chip status-chip-active"
                          : "status-chip status-chip-inactive"
                      }
                    >
                      {precio.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td>
                    <div className="toolbar">
                      <button className="link-button" type="button" onClick={() => startEdit(precio)}>
                        Editar
                      </button>

                      <button
                        className="danger-button"
                        disabled={deleteMutation.isPending}
                        type="button"
                        onClick={() => confirmDelete(precio)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay precios de alojamiento registrados.</p>
        )}
      </PageSection>
    </div>
  );
}