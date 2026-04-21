import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchCiudades, fetchContinentes, fetchPaises } from "@/core/catalog-api";
import { PageSection } from "@/components/PageSection";
import { listAgentes } from "@/modules/cliente-agente/cliente-agente-api";
import { clienteFormSchema, getCliente, saveCliente } from "@/modules/cliente/cliente-api";

export function ClienteFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id ? Number(params.id) : undefined;

  const isHydratingRef = useRef(false);

  const agentesQuery = useQuery({
    queryKey: ["agentes"],
    queryFn: listAgentes
  });

  const continentesQuery = useQuery({
    queryKey: ["continentes"],
    queryFn: fetchContinentes
  });

  const clienteQuery = useQuery({
    queryKey: ["cliente", editingId],
    queryFn: () => getCliente(editingId!),
    enabled: Boolean(editingId)
  });

  const form = useForm<any>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      idClienteAgente: null,
      nombreCompleto: "",
      email: "",
      telefono: "",
      idContinente: null,
      idPais: null,
      idCiudad: null,
      observaciones: "",
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
    if (clienteQuery.data) {
      const cliente = clienteQuery.data as any;

      isHydratingRef.current = true;

      form.reset({
        idClienteAgente: cliente.clienteAgente?.id ?? null,
        nombreCompleto: cliente.nombreCompleto,
        telefono: cliente.telefono ?? "",
        email: cliente.email ?? "",
        idContinente: cliente.pais?.continente?.id ?? null,
        idPais: cliente.pais?.id ?? null,
        idCiudad: cliente.ciudad?.id ?? null,
        observaciones: cliente.observaciones ?? "",
        activo: cliente.activo
      });

      // Dejamos que React termine de hidratar el formulario
      setTimeout(() => {
        isHydratingRef.current = false;
      }, 0);
    }
  }, [clienteQuery.data, form]);

  /**
   * Si cambia el continente, limpiamos país y ciudad.
   * Así evitamos que el usuario se quede con selecciones viejas
   * que pertenecían a otro continente.
   */
  useEffect(() => {
    if (isHydratingRef.current) {
      return;
    }

    form.setValue("idPais", null);
    form.setValue("idCiudad", null);
  }, [selectedContinenteId, form]);

  /**
   * Si cambia el país, limpiamos la ciudad.
   * Así la ciudad siempre depende del país realmente elegido.
   */
  useEffect(() => {
    if (isHydratingRef.current) {
      return;
    }

    form.setValue("idCiudad", null);
  }, [selectedPaisId, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => saveCliente(values, editingId),
    onSuccess: (data: any) => navigate(`/clientes/${data.id}`)
  });

  return (
    <PageSection
      action={
        <Link className="link-button" to="/clientes">
          Volver
        </Link>
      }
      title={editingId ? "Editar cliente" : "Nuevo cliente"}
    >
      <form className="stack" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid-2">
          <label>
            Nombre completo
            <input {...form.register("nombreCompleto")} />
          </label>

          <label>
            Agencia asociada
            <select {...form.register("idClienteAgente")}>
              <option value="">Sin agencia</option>
              {((agentesQuery.data ?? []) as Array<any>).map((agente) => (
                <option key={agente.id} value={agente.id}>
                  {agente.razonSocial}
                </option>
              ))}
            </select>
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
          Observaciones
          <textarea {...form.register("observaciones")} rows={3} />
        </label>

        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </PageSection>
  );
}