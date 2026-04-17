export type ClienteHistoryItem = {
  id: number;
  tipo: "COTIZACION" | "RESERVA";
  referencia: string;
  estado: string;
  fechaViajePrincipal: Date;
};
