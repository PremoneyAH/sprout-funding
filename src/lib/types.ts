import type { CCAA } from "./constants";

export interface BalanceYear {
  capital: number;
  prima_emision: number;
  reservas: number;
  acciones_propias: number;
  resultados_anteriores: number;
  otras_aportaciones: number;
  resultado_ejercicio: number;
  dividendo: number;
  otros_instrumentos: number;
}

export const emptyBalance = (): BalanceYear => ({
  capital: 0,
  prima_emision: 0,
  reservas: 0,
  acciones_propias: 0,
  resultados_anteriores: 0,
  otras_aportaciones: 0,
  resultado_ejercicio: 0,
  dividendo: 0,
  otros_instrumentos: 0,
});

export interface FormData {
  // Section A
  ccaa: CCAA | "";
  audita: "Sí" | "No" | "";
  caja: number;
  gasto_mensual: number;
  runway_override: number | null;

  // Section B
  balance_y1: BalanceYear;
  balance_y2: BalanceYear;

  // Section C
  fecha_ampliacion: string;
  importe_ampliacion: number;
  notas_convertibles: number;
  fecha_conversion_notas: string;
  tiene_revenue: "Sí" | "No" | "";
  tax_lease: "Sí" | "No" | "";
  riesgo_vivo_enisa: "Sí" | "No" | "";
  riesgo_vivo_balance: number;

  // Section D
  gasto_idi_n1: number;
  gasto_idi_n: number;
  gasto_inhouse_n1: number;
  gasto_inhouse_n: number;

  // Section E
  capex_industrial: "Sí" | "No" | "";
  contratar_doctores: "Sí" | "No" | "";
  internacionalizar: "Sí" | "No" | "";

  // Section F
  gasto_idi_deducciones_n2: number;
  gasto_idi_deducciones_n1: number | null; // auto from D
  gasto_idi_deducciones_n: number | null;  // auto from D
  gasto_subvencionado_n2: number;
  gasto_subvencionado_n1: number;
  gasto_subvencionado_n: number;
  ip_espana: "Sí" | "No" | "";
  bonifica_ss: "Sí" | "No" | "";
  sello_pyme: "Sí" | "No" | "";
}

export const defaultFormData: FormData = {
  ccaa: "",
  audita: "",
  caja: 0,
  gasto_mensual: 0,
  runway_override: null,
  balance_y1: emptyBalance(),
  balance_y2: emptyBalance(),
  fecha_ampliacion: "",
  importe_ampliacion: 0,
  notas_convertibles: 0,
  fecha_conversion_notas: "",
  tiene_revenue: "",
  tax_lease: "",
  riesgo_vivo_enisa: "",
  riesgo_vivo_balance: 0,
  gasto_idi_n1: 0,
  gasto_idi_n: 0,
  gasto_inhouse_n1: 0,
  gasto_inhouse_n: 0,
  capex_industrial: "",
  contratar_doctores: "",
  internacionalizar: "",
  gasto_idi_deducciones_n2: 0,
  gasto_idi_deducciones_n1: null,
  gasto_idi_deducciones_n: null,
  gasto_subvencionado_n2: 0,
  gasto_subvencionado_n1: 0,
  gasto_subvencionado_n: 0,
  ip_espana: "",
  bonifica_ss: "",
  sello_pyme: "",
};

export type Status = "OK" | "No cumple" | "Lo necesita" | string;

export interface CriterionResult {
  label: string;
  status: Status;
  type: "ok" | "fail" | "warning" | "value" | "info";
}

export interface ChecklistBlock {
  title: string;
  criteria: CriterionResult[];
  conclusion: CriterionResult;
}
