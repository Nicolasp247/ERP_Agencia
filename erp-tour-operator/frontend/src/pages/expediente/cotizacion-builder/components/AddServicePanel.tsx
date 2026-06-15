/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/components/AddServicePanel.tsx */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import { listServicios, listTiposServicio } from "@/modules/servicio/servicio-api";
import type { BuilderItemFormValues } from "@/modules/expediente/cotizacion-builder/cotizacion-builder-api";
import type { BuilderColumn } from "../types/cotizacion-builder.types";

type AddServicePanelProps = {
  columns: BuilderColumn[];
  isSaving?: boolean;
  defaultDate?: string;
  nextOrder: number;
  onCancel: () => void;
  onCreateItem: (values: BuilderItemFormValues) => void;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toNumberOrUndefined(value: string) {
  return value ? Number(value) : undefined;
}

function getServicioName(servicio: any) {
  return (
    servicio.previewCotizacion ||
    servicio.nombrePreview ||
    servicio.nombreWtravel ||
    servicio.nombre_wtravel ||
    "Servicio sin nombre"
  );
}

function isAlojamientoType(tipo: any) {
  const nombre = String(tipo?.nombre ?? "").trim().toLowerCase();
  const codigo = String(tipo?.codigo ?? "").trim().toLowerCase();

  return nombre === "alojamiento" || codigo === "alojamiento";
}

function getColumnLabel(column: BuilderColumn) {
  return `${column.grupo} ${column.nombre}`.trim();
}

function isOtherServiceType(tipo: any) {
  const nombre = String(tipo?.nombre ?? "").trim().toLowerCase();
  const codigo = String(tipo?.codigo ?? "").trim().toLowerCase();

  return nombre === "otro" || codigo === "otro";
}

export function AddServicePanel({
  columns,
  isSaving = false,
  defaultDate,
  nextOrder,
  onCancel,
  onCreateItem
}: AddServicePanelProps) {
  const [idContinente, setIdContinente] = useState("");
  const [idPais, setIdPais] = useState("");
  const [idCiudad, setIdCiudad] = useState("");
  const [idTipo, setIdTipo] = useState("");
  const [idServicio, setIdServicio] = useState("");
  const [idCotizacionColumnaManual, setIdCotizacionColumnaManual] = useState("");
  const [fechaServicio, setFechaServicio] = useState(defaultDate || todayIso());
  const [esOpcional, setEsOpcional] = useState(false);
  const [notaLinea, setNotaLinea] = useState("");
  const [alojamientoNoches, setAlojamientoNoches] = useState("1");
  const [alojamientoCategoriaHab, setAlojamientoCategoriaHab] = useState("ESTANDAR");
  const [alojamientoRegimen, setAlojamientoRegimen] = useState("ALOJAMIENTO_DESAYUNO");

  const continentesQuery = useQuery({
    queryKey: ["builder-continentes"],
    queryFn: fetchContinentes
  });

  const paisesQuery = useQuery({
    queryKey: ["builder-paises", idContinente],
    queryFn: () => fetchPaises(toNumberOrUndefined(idContinente)),
    enabled: Boolean(idContinente)
  });

  const ciudadesQuery = useQuery({
    queryKey: ["builder-ciudades", idPais],
    queryFn: () => fetchCiudades(toNumberOrUndefined(idPais)),
    enabled: Boolean(idPais)
  });

  const tiposQuery = useQuery({
    queryKey: ["builder-tipos-servicio"],
    queryFn: listTiposServicio
  });

  const serviciosQuery = useQuery({
    queryKey: ["builder-servicios", idContinente, idPais, idCiudad, idTipo],
    queryFn: () =>
      listServicios({
        idContinente: toNumberOrUndefined(idContinente),
        idPais: toNumberOrUndefined(idPais),
        idCiudad: toNumberOrUndefined(idCiudad),
        idTipo: toNumberOrUndefined(idTipo)
      }),
    enabled: Boolean(idCiudad) && Boolean(idTipo)
  });

  const servicios = useMemo(() => serviciosQuery.data ?? [], [serviciosQuery.data]);

  const selectedTipo = useMemo(
    () => (tiposQuery.data ?? []).find((tipo: any) => String(tipo.id) === idTipo),
    [tiposQuery.data, idTipo]
  );

  const isAlojamientoSelected = isAlojamientoType(selectedTipo);

  const isOtherSelected = isOtherServiceType(selectedTipo);

  const otherColumns = useMemo(
    () => columns.filter((column) => column.tipo === "OTRO"),
    [columns]
  );

  const shouldShowManualColumnSelector = isOtherSelected && !esOpcional;

  useEffect(() => {
    setIdPais("");
    setIdCiudad("");
    setIdServicio("");
  }, [idContinente]);

  useEffect(() => {
    setIdCiudad("");
    setIdServicio("");
  }, [idPais]);

  useEffect(() => {
    setAlojamientoNoches("1");
    setAlojamientoCategoriaHab("ESTANDAR");
    setAlojamientoRegimen("ALOJAMIENTO_DESAYUNO");
  }, [idTipo]);

  useEffect(() => {
    setIdCotizacionColumnaManual("");
  }, [idTipo, esOpcional]);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!idServicio) {
      return;
    }

    onCreateItem({
      idServicio: Number(idServicio),
      fechaServicio,
      ordenDia: nextOrder,
      esOpcional,
      notaLinea: notaLinea.trim() || null,
      idCotizacionColumnaManual:
        shouldShowManualColumnSelector && idCotizacionColumnaManual
          ? Number(idCotizacionColumnaManual)
          : undefined,
      alojamiento: isAlojamientoSelected
        ? {
            noches: Number(alojamientoNoches || 1),
            habitaciones: 1,
            categoriaHab: alojamientoCategoriaHab,
            regimen: alojamientoRegimen
          }
        : undefined
    });
  }

  return (
    <form className="builder-add-service-panel" onSubmit={submitForm}>
      <div className="builder-add-service-header">
        <div>
          <p className="eyebrow">Nuevo servicio</p>
          <h3>Añadir servicio a la cotización</h3>
        </div>

        <button className="link-button" onClick={onCancel} type="button">
          Cancelar
        </button>
      </div>

      <div className="builder-add-service-grid">
        <label>
          Continente
          <select
            value={idContinente}
            onChange={(event) => setIdContinente(event.target.value)}
            required
          >
            <option value="">Selecciona</option>
            {(continentesQuery.data ?? []).map((continente: any) => (
              <option key={continente.id} value={continente.id}>
                {continente.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          País
          <select
            value={idPais}
            onChange={(event) => setIdPais(event.target.value)}
            disabled={!idContinente}
            required
          >
            <option value="">Selecciona</option>
            {(paisesQuery.data ?? []).map((pais: any) => (
              <option key={pais.id} value={pais.id}>
                {pais.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ciudad
          <select
            value={idCiudad}
            onChange={(event) => setIdCiudad(event.target.value)}
            disabled={!idPais}
            required
          >
            <option value="">Selecciona</option>
            {(ciudadesQuery.data ?? []).map((ciudad: any) => (
              <option key={ciudad.id} value={ciudad.id}>
                {ciudad.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo servicio
          <select
            value={idTipo}
            onChange={(event) => setIdTipo(event.target.value)}
            required
          >
            <option value="">Selecciona</option>
            {(tiposQuery.data ?? []).map((tipo: any) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="builder-add-service-service-field">
          Servicio
          <select
            value={idServicio}
            onChange={(event) => setIdServicio(event.target.value)}
            disabled={!idCiudad || !idTipo || serviciosQuery.isLoading}
            required
          >
            <option value="">
              {!idCiudad || !idTipo
                ? "Selecciona ciudad y tipo"
                : serviciosQuery.isLoading
                  ? "Cargando servicios..."
                  : "Selecciona"}
            </option>

            {servicios.map((servicio: any) => (
              <option key={servicio.id} value={servicio.id}>
                {getServicioName(servicio)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fecha servicio
          <input
            type="date"
            value={fechaServicio}
            onChange={(event) => setFechaServicio(event.target.value)}
            required
          />
        </label>

        {isAlojamientoSelected ? (
          <>
            <label>
              Noches
              <input
                min={1}
                type="number"
                value={alojamientoNoches}
                onChange={(event) => setAlojamientoNoches(event.target.value)}
                required
              />
            </label>

            <label>
              Categoría habitación
              <select
                value={alojamientoCategoriaHab}
                onChange={(event) => setAlojamientoCategoriaHab(event.target.value)}
                required
              >
                <option value="ESTANDAR">Estándar</option>
                <option value="SUPERIOR">Superior</option>
                <option value="SUITE">Suite</option>
                <option value="OTRO">Otro</option>
              </select>
            </label>

            <label>
              Régimen
              <select
                value={alojamientoRegimen}
                onChange={(event) => setAlojamientoRegimen(event.target.value)}
                required
              >
                <option value="SOLO_ALOJAMIENTO">Solo alojamiento</option>
                <option value="ALOJAMIENTO_DESAYUNO">Alojamiento y desayuno</option>
                <option value="TODO_INCLUIDO">Todo incluido</option>
                <option value="OTRO">Otro</option>
              </select>
            </label>
          </>
        ) : null}

        <label className="builder-checkbox-field">
          <input
            type="checkbox"
            checked={esOpcional}
            onChange={(event) => setEsOpcional(event.target.checked)}
          />
          Servicio opcional
        </label>

        {shouldShowManualColumnSelector ? (
          <label className="builder-add-service-manual-column">
            Columna de precio
            <select
              value={idCotizacionColumnaManual}
              onChange={(event) => setIdCotizacionColumnaManual(event.target.value)}
              required
              disabled={!otherColumns.length}
            >
              <option value="">
                {otherColumns.length
                  ? "Selecciona la columna especial"
                  : "Primero crea una columna tipo Otro"}
              </option>

              {otherColumns.map((column) => (
                <option key={column.id} value={column.id}>
                  {getColumnLabel(column)}
                </option>
              ))}
            </select>

            <span className="builder-helper-text">
              Este campo define en qué columna especial aparecerá el precio del servicio tipo Otro.
              Ejemplo: si el servicio es “Seguro de viaje”, puedes elegir una columna llamada
              “Seguro Persona” para que el valor se muestre allí.
            </span>
          </label>
        ) : null}

        <label className="builder-add-service-notes">
          Notas
          <textarea
            value={notaLinea}
            onChange={(event) => setNotaLinea(event.target.value)}
            placeholder="Ej: confirmar horario, punto de encuentro, restricciones..."
          />
        </label>
      </div>

      {idCiudad && idTipo && !serviciosQuery.isLoading && !servicios.length ? (
        <div className="services-empty-state">
          No hay servicios para esos filtros.
        </div>
      ) : null}

      <div className="toolbar">
        <button
          className="primary-button"
          disabled={
            isSaving ||
            !idServicio ||
            (shouldShowManualColumnSelector && !idCotizacionColumnaManual)
          }
          type="submit"
        >
          Guardar servicio
        </button>
      </div>
    </form>
  );
}