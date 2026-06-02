/* erp-tour-operator/frontend/src/pages/agentes/AgenteFormPage.tsx */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import { PageSection } from "@/components/PageSection";
import {
  agenteFormSchema,
  getAgente,
  saveAgente,
  type AgenteComisionResponse,
  type AgenteFormValues
} from "@/modules/cliente-agente/cliente-agente-api";
import { AgenteComisionesFields } from "@/pages/agentes/components/AgenteComisionesFields";

const DEFAULT_COMISIONES: AgenteFormValues["comisiones"] = {
  terrestre: {
    porcentajeAgente: 12,
    porcentajeWtravel: 13,
    porcentajeBancario: 5
  },
  aerea: {
    porcentajeAgente: 5,
    porcentajeWtravel: 5,
    porcentajeBancario: 5
  }
};

function findCommission(
  comisiones: AgenteComisionResponse[] | undefined,
  tipoComision: "TERRESTRE" | "AEREA"
) {
  return comisiones?.find((commission) => commission.tipoComision === tipoComision);
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function AgenteFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id ? Number(params.id) : undefined;

  const continentesQuery = useQuery({
    queryKey: ["continentes"],
    queryFn: fetchContinentes
  });

  const agenteQuery = useQuery({
    queryKey: ["agente", editingId],
    queryFn: () => getAgente(editingId!),
    enabled: Boolean(editingId)
  });

  const form = useForm<AgenteFormValues>({
    resolver: zodResolver(agenteFormSchema),
    defaultValues: {
      codigo: "",
      razonSocial: "",
      nombreContacto: "",
      telefono: "",
      email: "",
      direccion: "",
      nit: "",
      idContinente: null,
      idPais: null,
      idCiudad: null,
      comisionBasePct: DEFAULT_COMISIONES.terrestre.porcentajeAgente,
      comisiones: DEFAULT_COMISIONES,
      activo: true
    }
  });

  const selectedContinenteId = form.watch("idContinente");
  const selectedPaisId = form.watch("idPais");
  const terrestreAgentePct = form.watch("comisiones.terrestre.porcentajeAgente");

  useEffect(() => {
    form.setValue("comisionBasePct", terrestreAgentePct, {
      shouldDirty: true,
      shouldValidate: true
    });
  }, [terrestreAgentePct, form]);

  const paisesQuery = useQuery({
    queryKey: ["paises", selectedContinenteId],
    queryFn: () => fetchPaises(selectedContinenteId ?? undefined),
    enabled: Boolean(selectedContinenteId)
  });

  const ciudadesQuery = useQuery({
    queryKey: ["ciudades", selectedPaisId],
    queryFn: () => fetchCiudades(selectedPaisId ?? undefined),
    enabled: Boolean(selectedPaisId)
  });

  useEffect(() => {
    if (!agenteQuery.data) {
      return;
    }

    const agente = agenteQuery.data as any;
    const terrestre = findCommission(agente.comisiones, "TERRESTRE");
    const aerea = findCommission(agente.comisiones, "AEREA");

    form.reset({
      codigo: agente.codigo,
      razonSocial: agente.razonSocial,
      nombreContacto: agente.nombreContacto ?? "",
      telefono: agente.telefono ?? "",
      email: agente.email ?? "",
      direccion: agente.direccion ?? "",
      nit: agente.nit ?? "",
      idContinente: agente.continente?.id ?? agente.pais?.continente?.id ?? null,
      idPais: agente.pais?.id ?? null,
      idCiudad: agente.ciudad?.id ?? null,
      comisionBasePct: agente.comisionBasePct
        ? Number(agente.comisionBasePct)
        : DEFAULT_COMISIONES.terrestre.porcentajeAgente,
      comisiones: {
        terrestre: {
          porcentajeAgente: toNumber(
            terrestre?.porcentajeAgente,
            agente.comisionBasePct ?? DEFAULT_COMISIONES.terrestre.porcentajeAgente
          ),
          porcentajeWtravel: toNumber(
            terrestre?.porcentajeWtravel,
            DEFAULT_COMISIONES.terrestre.porcentajeWtravel
          ),
          porcentajeBancario: toNumber(
            terrestre?.porcentajeBancario,
            DEFAULT_COMISIONES.terrestre.porcentajeBancario
          )
        },
        aerea: {
          porcentajeAgente: toNumber(aerea?.porcentajeAgente, DEFAULT_COMISIONES.aerea.porcentajeAgente),
          porcentajeWtravel: toNumber(aerea?.porcentajeWtravel, DEFAULT_COMISIONES.aerea.porcentajeWtravel),
          porcentajeBancario: toNumber(aerea?.porcentajeBancario, DEFAULT_COMISIONES.aerea.porcentajeBancario)
        }
      },
      activo: agente.activo
    });
  }, [agenteQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (values: AgenteFormValues) => saveAgente(values, editingId),
    onSuccess: (data: any) => navigate(`/agentes/${data.id}`)
  });

  return (
    <PageSection title={editingId ? "Editar cliente agente" : "Nuevo cliente agente"}>
      <form className="stack agente-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="agente-form-grid">
          <label>
            Código
            <input {...form.register("codigo")} />
          </label>

          <label>
            Razón social
            <input {...form.register("razonSocial")} />
          </label>

          <label>
            Contacto principal
            <input {...form.register("nombreContacto")} />
          </label>

          <label className="agente-field">
            Comisión base %
            <input
              disabled
              max={100}
              min={0}
              step="0.01"
              type="number"
              {...form.register("comisionBasePct")}
            />
            <small className="muted agente-helper-space">
              Se calcula desde Comisión terrestre - Agente %.
            </small>
          </label>

          <label className="agente-field">
            Email
            <input {...form.register("email")} type="email" />
            <small className="agente-helper-space" />
          </label>

          <label className="agente-field">
            Teléfono
            <input {...form.register("telefono")} />
            <small className="agente-helper-space" />
          </label>

          <label>
            Continente
            <select
              {...form.register("idContinente", {
                onChange: () => {
                  form.setValue("idPais", null);
                  form.setValue("idCiudad", null);
                }
              })}
            >
              <option value="">Sin continente</option>
              {(continentesQuery.data ?? []).map((continente) => (
                <option key={continente.id} value={continente.id}>
                  {continente.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            País
            <select
              {...form.register("idPais", {
                onChange: () => {
                  form.setValue("idCiudad", null);
                }
              })}
              disabled={!selectedContinenteId}
            >
              <option value="">Sin país</option>
              {(paisesQuery.data ?? []).map((pais) => (
                <option key={pais.id} value={pais.id}>
                  {pais.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ciudad
            <select {...form.register("idCiudad")} disabled={!selectedPaisId}>
              <option value="">Sin ciudad</option>
              {(ciudadesQuery.data ?? []).map((ciudad) => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        
        <div className="agente-address-grid">
          <label>
            Dirección
            <textarea {...form.register("direccion")} rows={1} />
          </label>

          <label>
            NIT
            <input {...form.register("nit")} />
          </label>
        </div>

        <AgenteComisionesFields form={form} />

        {mutation.isError ? (
          <p className="error-message">No se pudo guardar el cliente agente. Revisa los datos e inténtalo nuevamente.</p>
        ) : null}

        <div className="agente-form-actions">
          <Link className="link-button" to="/agentes">
            Cancelar
          </Link>

          <button className="primary-button" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </PageSection>
  );
}