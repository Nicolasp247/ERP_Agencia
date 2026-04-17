import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { PageSection } from "@/components/PageSection";
import { listServicios } from "@/modules/servicio/servicio-api";
import { listTarifas, saveTarifa, tarifaFormSchema } from "@/modules/tarifa/tarifa-api";

export function TarifasPage() {
  const tarifasQuery = useQuery({ queryKey: ["tarifas"], queryFn: listTarifas });
  const serviciosQuery = useQuery({ queryKey: ["servicios"], queryFn: listServicios });
  const form = useForm<any>({
    resolver: zodResolver(tarifaFormSchema),
    defaultValues: {
      anio: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      tipoHabitacion: "DBL",
      monedaCodigo: "USD",
      activo: true
    }
  });

  const mutation = useMutation({
    mutationFn: (values: any) => saveTarifa(values),
    onSuccess: () => {
      form.reset();
      void tarifasQuery.refetch();
    }
  });

  return (
    <div className="stack">
      <PageSection title="Nueva tarifa base">
        <form className="grid-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <label>
            Servicio
            <select {...form.register("idServicio")}>
              <option value="">Selecciona</option>
              {((serviciosQuery.data ?? []) as Array<any>).map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombreWtravel}
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
            <input {...form.register("mes")} type="number" />
          </label>
          <label>
            Tipo habitación
            <input {...form.register("tipoHabitacion")} />
          </label>
          <label>
            Precio
            <input {...form.register("precioUsd")} type="number" />
          </label>
          <label>
            Moneda
            <input {...form.register("monedaCodigo")} />
          </label>
          <button className="primary-button" type="submit">
            Guardar tarifa
          </button>
        </form>
      </PageSection>

      <PageSection title="Tarifas registradas">
        <table>
          <tbody>
            {((tarifasQuery.data ?? []) as Array<any>).map((tarifa) => (
              <tr key={`${tarifa.idServicio}-${tarifa.anio}-${tarifa.mes}-${tarifa.tipoHabitacion}`}>
                <td>{tarifa.servicio}</td>
                <td>
                  {tarifa.anio}/{tarifa.mes}
                </td>
                <td>{tarifa.tipoHabitacion}</td>
                <td>
                  {tarifa.precioUsd} {tarifa.monedaCodigo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>
    </div>
  );
}
