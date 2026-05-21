/*erp-tour-operator/frontend/src/pages/TarifasPage.tsx*/

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { PageSection } from "@/components/PageSection";
import { listServicios } from "@/modules/servicio/servicio-api";
import { listTarifas, saveTarifa, tarifaFormSchema } from "@/modules/tarifa/tarifa-api";
import { formatDateRangeShortEs, formatDateShortEs } from "@/utils/date-format";

const TIPOS_SIN_TARIFA_BASE = ["VUELO", "TREN", "OTRO"];

const TIPOS_TARIFA = [
  "GENERAL",
  "ADULTO",
  "NIÑO",
  "SGL",
  "DBL",
  "TPL",
  "VEHICULO",
  "GRUPO"
];

const UNIDADES_PRECIO = [
  "POR_PERSONA",
  "POR_SERVICIO",
  "POR_NOCHE",
  "POR_HABITACION",
  "POR_VEHICULO",
  "POR_GRUPO"
];

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getEndOfYearDate() {
  const year = new Date().getFullYear();
  return `${year}-12-31`;
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function TarifasPage() {
  const tarifasQuery = useQuery({
    queryKey: ["tarifas"],
    queryFn: listTarifas
  });

  const serviciosQuery = useQuery({
    queryKey: ["servicios"],
    queryFn: () => listServicios()
  });

  const form = useForm<any>({
    resolver: zodResolver(tarifaFormSchema),
    defaultValues: {
      fechaDesde: getTodayDate(),
      fechaHasta: getEndOfYearDate(),
      tipoTarifa: "GENERAL",
      unidadPrecio: "POR_PERSONA",
      precioNeto: "",
      monedaCodigo: "USD",
      activo: true,
      observaciones: "",
      fechaRevision: getTodayDate()
    }
  });

  const serviciosTarifables = useMemo(() => {
    return ((serviciosQuery.data ?? []) as Array<any>)
      .filter((servicio) => !TIPOS_SIN_TARIFA_BASE.includes(servicio.tipoCodigo))
      .filter((servicio) => servicio.activo)
      .sort((a, b) =>
        String(a.nombreWtravel ?? "").localeCompare(String(b.nombreWtravel ?? ""), "es", {
          sensitivity: "base"
        })
      );
  }, [serviciosQuery.data]);

  const mutation = useMutation({
    mutationFn: (values: any) => saveTarifa(values),
    onSuccess: () => {
      form.reset({
        fechaDesde: getTodayDate(),
        fechaHasta: getEndOfYearDate(),
        tipoTarifa: "GENERAL",
        unidadPrecio: "POR_PERSONA",
        precioNeto: "",
        monedaCodigo: "USD",
        activo: true,
        observaciones: "",
        fechaRevision: getTodayDate()
      });

      void tarifasQuery.refetch();
    }
  });

  return (
    <div className="stack">
      <PageSection title="Nueva tarifa base">
        <form className="form-grid" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid-3">
            <label>
              Servicio
              <select {...form.register("idServicio")}>
                <option value="">Selecciona</option>
                {serviciosTarifables.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombreWtravel}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha desde
              <input {...form.register("fechaDesde")} type="date" />
            </label>

            <label>
              Fecha hasta
              <input {...form.register("fechaHasta")} type="date" />
            </label>
          </div>

          <div className="grid-3">
            <label>
              Tipo tarifa
              <select {...form.register("tipoTarifa")}>
                {TIPOS_TARIFA.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {formatLabel(tipo)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Unidad precio
              <select {...form.register("unidadPrecio")}>
                {UNIDADES_PRECIO.map((unidad) => (
                  <option key={unidad} value={unidad}>
                    {formatLabel(unidad)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Precio neto
              <input {...form.register("precioNeto")} type="number" step="0.01" />
            </label>
          </div>

          <div className="grid-3">
            <label>
              Moneda
              <input {...form.register("monedaCodigo")} maxLength={3} />
            </label>

            <label>
              Fecha revisión
              <input {...form.register("fechaRevision")} type="date" />
            </label>

            <label>
              Estado
              <select {...form.register("activo")}>
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </label>
          </div>

          <label>
            Observaciones
            <textarea
              {...form.register("observaciones")}
              placeholder="Ej: revisado en Civitatis, contrato proveedor, tarifa temporada alta..."
            />
          </label>

          <button className="primary-button" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Guardar tarifa"}
          </button>
        </form>
      </PageSection>

      <PageSection title="Tarifas registradas">
        {((tarifasQuery.data ?? []) as Array<any>).length ? (
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Vigencia</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th>Precio neto</th>
                <th>Revisión</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {((tarifasQuery.data ?? []) as Array<any>).map((tarifa) => (
                <tr key={tarifa.id}>
                  <td>
                    <strong>{tarifa.servicio}</strong>
                    <p className="table-subtext">
                      {tarifa.tipoServicio} · {tarifa.proveedor} · {tarifa.ciudad}
                    </p>
                  </td>

                  <td>
                    {formatDateRangeShortEs(tarifa.fechaDesde, tarifa.fechaHasta)}
                  </td>

                  <td>{formatLabel(tarifa.tipoTarifa)}</td>
                  <td>{formatLabel(tarifa.unidadPrecio)}</td>

                  <td>
                    {tarifa.precioNeto} {tarifa.monedaCodigo}
                  </td>

                  <td>{formatDateShortEs(tarifa.fechaRevision)}</td>

                  <td>
                    <span
                      className={
                        tarifa.activo
                          ? "status-chip status-chip-active"
                          : "status-chip status-chip-inactive"
                      }
                    >
                      {tarifa.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay tarifas registradas.</p>
        )}
      </PageSection>
    </div>
  );
}