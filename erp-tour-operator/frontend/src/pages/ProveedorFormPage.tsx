import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchCiudades, fetchPaises } from "@/core/catalog-api";
import { PageSection } from "@/components/PageSection";
import { getProveedor, proveedorFormSchema, saveProveedor } from "@/modules/proveedor/proveedor-api";

export function ProveedorFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id ? Number(params.id) : undefined;
  const paisesQuery = useQuery({ queryKey: ["paises"], queryFn: fetchPaises });
  const proveedorQuery = useQuery({
    queryKey: ["proveedor", editingId],
    queryFn: () => getProveedor(editingId!),
    enabled: Boolean(editingId)
  });

  const form = useForm<any>({
    resolver: zodResolver(proveedorFormSchema),
    defaultValues: {
      nombreComercial: "",
      sitioWeb: "",
      contactos: [{ email: "", principal: true, activo: true }]
    }
  });

  const fieldArray = useFieldArray<any>({
    control: form.control,
    name: "contactos"
  });

  const ciudadesQuery = useQuery({
    queryKey: ["ciudades", form.watch("idPais")],
    queryFn: () => fetchCiudades(form.watch("idPais") ?? undefined),
    enabled: Boolean(form.watch("idPais"))
  });

  useEffect(() => {
    if (proveedorQuery.data) {
      const proveedor = proveedorQuery.data as any;
      form.reset({
        codigo: proveedor.codigo ?? "",
        nombreComercial: proveedor.nombreComercial,
        sitioWeb: proveedor.sitioWeb ?? "",
        idPais: proveedor.pais?.id ?? null,
        idCiudad: proveedor.ciudad?.id ?? null,
        observaciones: proveedor.observaciones ?? "",
        activo: proveedor.activo,
        contactos: proveedor.contactos.length
          ? proveedor.contactos
          : [{ email: "", principal: true, activo: true }]
      });
    }
  }, [form, proveedorQuery.data]);

  const mutation = useMutation({
    mutationFn: (values: any) => saveProveedor(values, editingId),
    onSuccess: (data: any) => navigate(`/proveedores/${data.id}`)
  });

  return (
    <PageSection
      action={
        <Link className="link-button" to="/proveedores">
          Volver
        </Link>
      }
      title={editingId ? "Editar proveedor" : "Nuevo proveedor"}
    >
      <form className="stack" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid-2">
          <label>
            Código
            <input {...form.register("codigo")} />
          </label>
          <label>
            Nombre comercial
            <input {...form.register("nombreComercial")} />
          </label>
          <label>
            Sitio web
            <input {...form.register("sitioWeb")} />
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

        <PageSection
          action={
            <button
              className="link-button"
              onClick={() => fieldArray.append({ email: "", principal: false, activo: true })}
              type="button"
            >
              Añadir contacto
            </button>
          }
          title="Contactos"
        >
          <div className="stack">
            {fieldArray.fields.map((field, index) => (
              <div className="grid-3" key={field.id}>
                <label>
                  Nombre
                  <input {...form.register(`contactos.${index}.nombreContacto`)} />
                </label>
                <label>
                  Email
                  <input {...form.register(`contactos.${index}.email`)} type="email" />
                </label>
                <label>
                  Teléfono
                  <input {...form.register(`contactos.${index}.telefono`)} />
                </label>
              </div>
            ))}
          </div>
        </PageSection>

        <button className="primary-button" type="submit">
          Guardar
        </button>
      </form>
    </PageSection>
  );
}
