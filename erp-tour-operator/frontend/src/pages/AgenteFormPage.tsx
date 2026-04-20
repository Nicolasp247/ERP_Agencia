import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import { PageSection } from "@/components/PageSection";
import { agenteFormSchema, getAgente, saveAgente } from "@/modules/cliente-agente/cliente-agente-api";

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

  const form = useForm<any>({
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
      comisionBasePct: 0,
      activo: true
    }
  });

  const selectedContinenteId = form.watch("idContinente");
  const selectedPaisId = form.watch("idPais");

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
    if (agenteQuery.data) {
      const agente = agenteQuery.data as any;

      form.reset({
        codigo: agente.codigo,
        razonSocial: agente.razonSocial,
        nombreContacto: agente.nombreContacto ?? "",
        telefono: agente.telefono ?? "",
        email: agente.email ?? "",
        direccion: agente.direccion ?? "",
        nit: agente.nit ?? "",
        idContinente: agente.pais?.continente?.id ?? null,
        idPais: agente.pais?.id ?? null,
        idCiudad: agente.ciudad?.id ?? null,
        comisionBasePct: agente.comisionBasePct ? Number(agente.comisionBasePct) : 0,
        activo: agente.activo
      });
    }
  }, [agenteQuery.data, form]);

  /**
   * Si cambia el continente, limpiamos país y ciudad.
   * Así evitamos que queden selecciones viejas mezcladas.
   */
  useEffect(() => {
    form.setValue("idPais", null);
    form.setValue("idCiudad", null);
  }, [selectedContinenteId]);

  /**
   * Si cambia el país, limpiamos la ciudad.
   * Así la ciudad siempre pertenece al país actual.
   */
  useEffect(() => {
    form.setValue("idCiudad", null);
  }, [selectedPaisId]);

  const mutation = useMutation({
    mutationFn: (values: any) => saveAgente(values, editingId),
    onSuccess: (data: any) => navigate(`/agentes/${data.id}`)
  });

  return (
    <PageSection
      action={
        <Link className="link-button" to="/agentes">
          Volver
        </Link>
      }
      title={editingId ? "Editar cliente agente" : "Nuevo cliente agente"}
    >
      <form className="stack" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid-2">
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

          <label>
            Comisión base %
            <input {...form.register("comisionBasePct")} type="number" />
          </label>

          <label>
            Email
            <input {...form.register("email")} type="email" />
          </label>

          <label>
            Teléfono
            <input {...form.register("telefono")} />
          </label>

          <label>
            Continente
            <select {...form.register("idContinente")}>
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
            <select {...form.register("idPais")} disabled={!selectedContinenteId}>
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

        <label>
          Dirección
          <textarea {...form.register("direccion")} rows={3} />
        </label>

        <label>
          NIT
          <input {...form.register("nit")} />
        </label>

        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </PageSection>
  );
}