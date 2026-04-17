import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchCiudades, fetchPaises } from "@/core/catalog-api";
import { PageSection } from "@/components/PageSection";
import { listAgentes } from "@/modules/cliente-agente/cliente-agente-api";
import { clienteFormSchema, getCliente, saveCliente } from "@/modules/cliente/cliente-api";

export function ClienteFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id ? Number(params.id) : undefined;

  const agentesQuery = useQuery({ queryKey: ["agentes"], queryFn: listAgentes });
  const paisesQuery = useQuery({ queryKey: ["paises"], queryFn: fetchPaises });
  const clienteQuery = useQuery({
    queryKey: ["cliente", editingId],
    queryFn: () => getCliente(editingId!),
    enabled: Boolean(editingId)
  });

  const form = useForm<any>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nombreCompleto: "",
      email: "",
      telefono: "",
      observaciones: "",
      activo: true
    }
  });

  const ciudadesQuery = useQuery({
    queryKey: ["ciudades", form.watch("idPais")],
    queryFn: () => fetchCiudades(form.watch("idPais") ?? undefined),
    enabled: Boolean(form.watch("idPais"))
  });

  useEffect(() => {
    if (clienteQuery.data) {
      const cliente = clienteQuery.data as any;
      form.reset({
        idClienteAgente: cliente.clienteAgente?.id ?? null,
        nombreCompleto: cliente.nombreCompleto,
        telefono: cliente.telefono ?? "",
        email: cliente.email ?? "",
        idPais: cliente.pais?.id ?? null,
        idCiudad: cliente.ciudad?.id ?? null,
        observaciones: cliente.observaciones ?? "",
        activo: cliente.activo
      });
    }
  }, [clienteQuery.data, form]);

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
            País
            <select {...form.register("idPais")}>
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
            <select {...form.register("idCiudad")}>
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

        <button className="primary-button" type="submit">
          Guardar
        </button>
      </form>
    </PageSection>
  );
}
