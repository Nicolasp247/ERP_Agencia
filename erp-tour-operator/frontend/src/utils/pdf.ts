import { api } from "@/services/http";

export async function openPdf(path: string) {
  const response = await api.get(path, {
    responseType: "blob"
  });

  const url = URL.createObjectURL(response.data);
  window.open(url, "_blank", "noopener,noreferrer");
}
