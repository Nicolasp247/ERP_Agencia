/* erp-tour-operator/frontend/src/pages/TarifasPage.tsx */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { PageSection } from "@/components/PageSection";
import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import {
  alojamientoPrecioFormSchema,
  deleteAlojamientoPrecio,
  listAlojamientoPrecios,
  saveAlojamientoPrecio,
  updateAlojamientoPrecio,
  type AlojamientoPrecio
} from "@/modules/alojamiento-precio/alojamiento-precio-api";
import { listServicios, listTiposServicio } from "@/modules/servicio/servicio-api";
import { listTarifas, saveTarifa, tarifaFormSchema } from "@/modules/tarifa/tarifa-api";
import { AlojamientoPrecioForm } from "@/pages/tarifa/components/AlojamientoPrecioForm";
import { AlojamientoPreciosTable } from "@/pages/tarifa/components/AlojamientoPreciosTable";
import { TarifaBaseForm } from "@/pages/tarifa/components/TarifaBaseForm";
import { TarifaFiltersPanel } from "@/pages/tarifa/components/TarifaFiltersPanel";
import { TarifasRegistradasTable } from "@/pages/tarifa/components/TarifasRegistradasTable";
import {
  getDefaultAlojamientoValues,
  getDefaultTarifaValues,
  isAlojamientoServicio
} from "@/pages/tarifa/utils/tarifa.helpers";

export function TarifasPage() {
  const [idTipo, setIdTipo] = useState("");
  const [idContinente, setIdContinente] = useState("");
  const [idPais, setIdPais] = useState("");
  const [idCiudad, setIdCiudad] = useState("");
  const [idServicioSeleccionado, setIdServicioSeleccionado] = useState("");
  const [alojamientoEditandoId, setAlojamientoEditandoId] = useState<number | null>(null);

  const tiposQuery = useQuery({
    queryKey: ["tipos-servicio"],
    queryFn: listTiposServicio
  });

  const tarifasQuery = useQuery({
    queryKey: ["tarifas"],
    queryFn: listTarifas
  });

  const serviciosQuery = useQuery({
    queryKey: ["tarifas-servicios", { idContinente, idPais, idCiudad, idTipo }],
    queryFn: () =>
      listServicios({
        idContinente: idContinente ? Number(idContinente) : undefined,
        idPais: idPais ? Number(idPais) : undefined,
        idCiudad: idCiudad ? Number(idCiudad) : undefined,
        idTipo: idTipo ? Number(idTipo) : undefined
      })
  });

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

  const servicios = useMemo(() => {
    return ((serviciosQuery.data ?? []) as Array<any>).filter(
      (servicio) => servicio.activo !== false
    );
  }, [serviciosQuery.data]);

  const serviciosFiltrados = useMemo(() => {
    return [...servicios].sort((a, b) =>
      String(a.nombreWtravel ?? "").localeCompare(String(b.nombreWtravel ?? ""), "es", {
        sensitivity: "base"
      })
    );
  }, [servicios]);

  const servicioSeleccionado = useMemo(() => {
    return servicios.find((servicio) => String(servicio.id) === idServicioSeleccionado) ?? null;
  }, [servicios, idServicioSeleccionado]);

  const isAlojamientoSeleccionado = isAlojamientoServicio(servicioSeleccionado);

  const tarifasNormales = useMemo(() => {
    return ((tarifasQuery.data ?? []) as Array<any>).filter((tarifa) => {
      if (!idServicioSeleccionado) {
        return true;
      }

      return Number(tarifa.idServicio) === Number(idServicioSeleccionado);
    });
  }, [tarifasQuery.data, idServicioSeleccionado]);

  const alojamientoPreciosQuery = useQuery({
    queryKey: ["alojamiento-precios", servicioSeleccionado?.idCiudad],
    queryFn: () =>
      listAlojamientoPrecios({
        idCiudad: servicioSeleccionado?.idCiudad
          ? Number(servicioSeleccionado.idCiudad)
          : undefined
      }),
    enabled: Boolean(isAlojamientoSeleccionado && servicioSeleccionado?.idCiudad)
  });

  const form = useForm<any>({
    resolver: zodResolver(tarifaFormSchema),
    defaultValues: getDefaultTarifaValues()
  });

  const alojamientoForm = useForm<any>({
    resolver: zodResolver(alojamientoPrecioFormSchema),
    defaultValues: getDefaultAlojamientoValues()
  });

  const tarifaMutation = useMutation({
    mutationFn: (values: any) => saveTarifa(values),
    onSuccess: () => {
      form.reset(
        getDefaultTarifaValues(
          idServicioSeleccionado ? Number(idServicioSeleccionado) : undefined
        )
      );

      void tarifasQuery.refetch();
    }
  });

  const alojamientoMutation = useMutation({
    mutationFn: (values: any) => {
      if (alojamientoEditandoId) {
        return updateAlojamientoPrecio(alojamientoEditandoId, values);
      }

      return saveAlojamientoPrecio(values);
    },
    onSuccess: () => {
      const idCiudadBase = servicioSeleccionado?.idCiudad
        ? Number(servicioSeleccionado.idCiudad)
        : undefined;

      setAlojamientoEditandoId(null);
      alojamientoForm.reset(getDefaultAlojamientoValues(idCiudadBase));
      void alojamientoPreciosQuery.refetch();
    }
  });

  const eliminarAlojamientoMutation = useMutation({
    mutationFn: deleteAlojamientoPrecio,
    onSuccess: () => {
      void alojamientoPreciosQuery.refetch();
    }
  });

  function limpiarFiltros() {
    setIdTipo("");
    setIdContinente("");
    setIdPais("");
    setIdCiudad("");
    setIdServicioSeleccionado("");
    setAlojamientoEditandoId(null);

    form.reset(getDefaultTarifaValues());
    alojamientoForm.reset(getDefaultAlojamientoValues());
  }

  function seleccionarServicio(idServicio: string) {
    setIdServicioSeleccionado(idServicio);
    setAlojamientoEditandoId(null);

    const servicio = servicios.find((item) => String(item.id) === idServicio) ?? null;

    if (!servicio) {
      form.reset(getDefaultTarifaValues());
      alojamientoForm.reset(getDefaultAlojamientoValues());
      return;
    }

    form.reset(getDefaultTarifaValues(Number(servicio.id)));

    if (isAlojamientoServicio(servicio)) {
      alojamientoForm.reset(getDefaultAlojamientoValues(Number(servicio.idCiudad)));
    }
  }

  function editarAlojamientoPrecio(precio: AlojamientoPrecio) {
    setAlojamientoEditandoId(precio.id);

    alojamientoForm.reset({
      idCiudad: precio.idCiudad,
      categoria: precio.categoria,
      categoriaHab: precio.categoriaHab,
      regimen: precio.regimen,
      fechaDesde: precio.fechaDesde,
      fechaHasta: precio.fechaHasta,
      tipoHabitacion: precio.tipoHabitacion,
      precioUsd: precio.precioUsd ?? 0,
      monedaCodigo: precio.monedaCodigo,
      activo: precio.activo
    });
  }

  function cancelarEdicionAlojamiento() {
    const idCiudadBase = servicioSeleccionado?.idCiudad
      ? Number(servicioSeleccionado.idCiudad)
      : undefined;

    setAlojamientoEditandoId(null);
    alojamientoForm.reset(getDefaultAlojamientoValues(idCiudadBase));
  }

  function eliminarAlojamientoPrecio(precio: AlojamientoPrecio) {
    const confirmed = window.confirm(
      `¿Eliminar precio ${precio.categoriaLabel} ${precio.tipoHabitacionLabel} de ${precio.ciudad}?`
    );

    if (confirmed) {
      eliminarAlojamientoMutation.mutate(precio.id);
    }
  }

  function guardarAlojamientoPrecio(values: any) {
    if (!servicioSeleccionado?.idCiudad) {
      return;
    }

    alojamientoMutation.mutate({
      idCiudad: Number(servicioSeleccionado.idCiudad),
      categoria: values.categoria,
      categoriaHab: values.categoriaHab,
      regimen: values.regimen,
      fechaDesde: values.fechaDesde,
      fechaHasta: values.fechaHasta,
      tipoHabitacion: values.tipoHabitacion,
      precioUsd: Number(values.precioUsd),
      monedaCodigo: values.monedaCodigo || "USD",
      activo: values.activo === true || values.activo === "true"
    });
  }

  return (
    <div className="stack">
      <PageSection
        title="Tarifas"
        subtitle="Filtra el servicio y carga su tarifa. Si el servicio es alojamiento, se activa la matriz especial por rango de fechas."
      >
        <TarifaFiltersPanel
          tipos={tiposQuery.data ?? []}
          continentes={continentesQuery.data ?? []}
          paises={paisesQuery.data ?? []}
          ciudades={ciudadesQuery.data ?? []}
          servicios={serviciosFiltrados}
          idTipo={idTipo}
          idContinente={idContinente}
          idPais={idPais}
          idCiudad={idCiudad}
          idServicio={idServicioSeleccionado}
          onChangeTipo={(value) => {
            setIdTipo(value);
            setIdServicioSeleccionado("");
          }}
          onChangeContinente={(value) => {
            setIdContinente(value);
            setIdPais("");
            setIdCiudad("");
            setIdServicioSeleccionado("");
          }}
          onChangePais={(value) => {
            setIdPais(value);
            setIdCiudad("");
            setIdServicioSeleccionado("");
          }}
          onChangeCiudad={(value) => {
            setIdCiudad(value);
            setIdServicioSeleccionado("");
          }}
          onChangeServicio={seleccionarServicio}
          onClear={limpiarFiltros}
        />
      </PageSection>

      {!servicioSeleccionado ? (
        <PageSection title="Selecciona un servicio">
          <p>Elige un servicio para cargar o revisar sus tarifas.</p>
        </PageSection>
      ) : null}

      {servicioSeleccionado && !isAlojamientoSeleccionado ? (
        <PageSection title="Nueva tarifa base">
          <TarifaBaseForm
            form={form}
            servicio={servicioSeleccionado}
            isSaving={tarifaMutation.isPending}
            onSubmit={(values) => tarifaMutation.mutate(values)}
          />
        </PageSection>
      ) : null}

      {servicioSeleccionado && isAlojamientoSeleccionado ? (
        <PageSection title="Precio de alojamiento">
          <AlojamientoPrecioForm
            form={alojamientoForm}
            servicio={servicioSeleccionado}
            isSaving={alojamientoMutation.isPending}
            isEditing={Boolean(alojamientoEditandoId)}
            onSubmit={guardarAlojamientoPrecio}
            onCancelEdit={cancelarEdicionAlojamiento}
          />
        </PageSection>
      ) : null}

      {servicioSeleccionado && !isAlojamientoSeleccionado ? (
        <PageSection title="Tarifas registradas">
          <TarifasRegistradasTable tarifas={tarifasNormales} />
        </PageSection>
      ) : null}

      {servicioSeleccionado && isAlojamientoSeleccionado ? (
        <PageSection title="Precios de alojamiento registrados">
          <AlojamientoPreciosTable
            precios={alojamientoPreciosQuery.data ?? []}
            isDeleting={eliminarAlojamientoMutation.isPending}
            onEdit={editarAlojamientoPrecio}
            onDelete={eliminarAlojamientoPrecio}
          />
        </PageSection>
      ) : null}
    </div>
  );
}