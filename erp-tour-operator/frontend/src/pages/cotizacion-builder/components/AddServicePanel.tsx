/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/AddServicePanel.tsx */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import { listServicios, listTiposServicio } from "@/modules/servicio/servicio-api";
import type { BuilderItemFormValues } from "@/modules/cotizacion-builder/cotizacion-builder-api";

type AddServicePanelProps = {
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

export function AddServicePanel({
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
  const [fechaServicio, setFechaServicio] = useState(defaultDate || todayIso());
  const [esOpcional, setEsOpcional] = useState(false);
  const [notaLinea, setNotaLinea] = useState("");

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
    setIdServicio("");
  }, [idCiudad, idTipo]);

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
      notaLinea: notaLinea.trim() || null
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

        <label className="builder-checkbox-field">
          <input
            type="checkbox"
            checked={esOpcional}
            onChange={(event) => setEsOpcional(event.target.checked)}
          />
          Servicio opcional
        </label>

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
        <button className="primary-button" disabled={isSaving || !idServicio} type="submit">
          Guardar servicio
        </button>
      </div>
    </form>
  );
}