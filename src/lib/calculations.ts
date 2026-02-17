import type { FormData, BalanceYear, ChecklistBlock, CriterionResult } from "./types";
import {
  CCAA_THRESHOLDS,
  TABLA_SIN_HISTORICO,
  TABLA_CON_HISTORICO,
  type CCAA,
  type Rating,
} from "./constants";

// ─── Helpers ───────────────────────────────────────────────

export function patrimonioNeto(b: BalanceYear): number {
  return (
    b.capital +
    b.prima_emision +
    b.reservas +
    b.acciones_propias +
    b.resultados_anteriores +
    b.otras_aportaciones +
    b.otros_instrumentos -
    b.dividendo +
    b.resultado_ejercicio
  );
}

export function runway(d: FormData): number {
  if (d.runway_override !== null && d.runway_override > 0) return d.runway_override;
  if (d.gasto_mensual <= 0) return 0;
  return Math.round((d.caja / d.gasto_mensual) * 100) / 100;
}

function monthsDiff(dateStr: string, ref: Date): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return Math.abs((ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
}

// ─── Empresa en crisis — Directiva Europea (ENISA) ─────────

export function empresaCrisisDirectiva(b: BalanceYear): "EMPRESA SOLVENTE" | "EMPRESA EN CRISIS" {
  const mitadCapital = (b.capital + b.prima_emision) / 2;
  const perdidasAcumuladas = -(
    b.reservas +
    b.acciones_propias +
    b.resultados_anteriores +
    b.otras_aportaciones +
    b.resultado_ejercicio +
    b.dividendo +
    b.otros_instrumentos
  );
  return mitadCapital < perdidasAcumuladas ? "EMPRESA EN CRISIS" : "EMPRESA SOLVENTE";
}

// ─── Empresa en crisis — CDTI ──────────────────────────────

export function empresaCrisisCDTI(b: BalanceYear): "Empresa Solvente" | "EMPRESA EN CRISIS" {
  const capitalPrima = b.capital + b.prima_emision;
  if (capitalPrima === 0) return "EMPRESA EN CRISIS";
  const pn = patrimonioNeto(b);
  const ratio = pn / capitalPrima;
  return ratio < 0.5001 ? "EMPRESA EN CRISIS" : "Empresa Solvente";
}

// ─── Status helpers ────────────────────────────────────────

function ok(): CriterionResult & { type: "ok" } {
  return { label: "", status: "OK", type: "ok" };
}
function fail(): CriterionResult & { type: "fail" } {
  return { label: "", status: "No cumple", type: "fail" };
}
function warn(status: string): CriterionResult & { type: "warning" } {
  return { label: "", status, type: "warning" };
}
function info(status: string): CriterionResult & { type: "info" } {
  return { label: "", status, type: "info" };
}

// ─── ENISA Checklist ───────────────────────────────────────

export function evaluateENISA(d: FormData): ChecklistBlock {
  const ccaa = d.ccaa as CCAA;
  const th = ccaa ? CCAA_THRESHOLDS[ccaa] : null;
  const hoy = new Date();

  const pnY1 = patrimonioNeto(d.balance_y1);
  const rw = runway(d);
  const crisisY1 = empresaCrisisDirectiva(d.balance_y1);

  // E1
  const e1 = ccaa === "Otro" || !ccaa ? { ...fail(), label: "E1 — Domicilio fiscal" } : { ...ok(), label: "E1 — Domicilio fiscal" };

  // E2
  const e2Audita = d.audita === "Sí";
  const e2: CriterionResult = {
    label: "E2 — Auditoría",
    status: d.audita || "—",
    type: e2Audita ? "ok" : d.audita === "No" ? "fail" : "info",
  };

  // E3
  const e3 = th && rw > th.runwayMin
    ? { ...ok(), label: "E3 — Runway mínimo" }
    : { ...fail(), label: "E3 — Runway mínimo" };

  // E4
  const e4 = pnY1 > 0 && crisisY1 === "EMPRESA SOLVENTE"
    ? { ...ok(), label: "E4 — Fondos propios positivos" }
    : { ...fail(), label: "E4 — Fondos propios positivos" };

  // E5
  const mesesAmp = monthsDiff(d.fecha_ampliacion, hoy);
  const e5 = th && mesesAmp < th.mesesMaxAmpliacion
    ? { ...ok(), label: "E5 — Fecha última ampliación" }
    : { ...fail(), label: "E5 — Fecha última ampliación" };

  // E6
  const e6 = th && d.importe_ampliacion >= th.importeMinAmpliacion
    ? { ...ok(), label: "E6 — Importe ampliación" }
    : { ...fail(), label: "E6 — Importe ampliación" };

  // E7
  let e7: CriterionResult;
  if (d.notas_convertibles === 0 || !d.fecha_conversion_notas) {
    e7 = { ...ok(), label: "E7 — Fecha conversión notas" };
  } else {
    const mesesConv = monthsDiff(d.fecha_conversion_notas, hoy);
    e7 = mesesConv < 6 && mesesConv > 0
      ? { ...ok(), label: "E7 — Fecha conversión notas" }
      : { ...fail(), label: "E7 — Fecha conversión notas" };
  }

  // E8
  const e8 = d.notas_convertibles > 100000
    ? { ...fail(), label: "E8 — Importe notas convertibles" }
    : { ...ok(), label: "E8 — Importe notas convertibles" };

  // E9
  const e9 = d.tiene_revenue === "Sí"
    ? { ...ok(), label: "E9 — Revenue devengado 6 meses" }
    : { ...fail(), label: "E9 — Revenue devengado 6 meses" };

  // E10
  const e10 = d.tax_lease === "No"
    ? { ...ok(), label: "E10 — Tax lease" }
    : { ...fail(), label: "E10 — Tax lease" };

  // Conclusion
  const viaAmpliacion = e5.type === "ok" && e6.type === "ok";
  const viaNotas = e7.type === "ok" && e8.type === "ok";
  const enisaOk =
    e1.type === "ok" &&
    e3.type === "ok" &&
    e4.type === "ok" &&
    (viaAmpliacion || viaNotas) &&
    e9.type === "ok" &&
    e10.type === "ok";

  const conclusion: CriterionResult = enisaOk
    ? { label: "Conclusión ENISA", status: "SÍ", type: "ok" }
    : { label: "Conclusión ENISA", status: "No cumple", type: "fail" };

  return {
    title: "ENISA",
    criteria: [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10],
    conclusion,
  };
}

// ─── CDTI Checklist ────────────────────────────────────────

export function evaluateCDTI(d: FormData): ChecklistBlock {
  const ccaa = d.ccaa as CCAA;
  const th = ccaa ? CCAA_THRESHOLDS[ccaa] : null;

  const c1 = ccaa === "Otro" || !ccaa ? { ...fail(), label: "C1 — Domicilio fiscal" } : { ...ok(), label: "C1 — Domicilio fiscal" };

  const crisisY1 = empresaCrisisCDTI(d.balance_y1);
  const crisisY2 = empresaCrisisCDTI(d.balance_y2);
  const c2 = crisisY1 === "Empresa Solvente" && crisisY2 === "Empresa Solvente"
    ? { ...ok(), label: "C2 — Empresa en crisis" }
    : { ...fail(), label: "C2 — Empresa en crisis" };

  const c3 = { ...c2, label: "C3 — Dos años de histórico" };

  const c4 = th && d.gasto_inhouse_n1 > th.minGastoIdiCdti
    ? { ...ok(), label: "C4 — Gasto I+D+i in-house" }
    : { ...fail(), label: "C4 — Gasto I+D+i in-house" };

  const cdtiOk = c1.type === "ok" && c2.type === "ok" && c3.type === "ok" && c4.type === "ok";

  return {
    title: "CDTI",
    criteria: [c1, c2, c3, c4],
    conclusion: cdtiOk
      ? { label: "Conclusión CDTI", status: "OK", type: "ok" }
      : { label: "Conclusión CDTI", status: "No cumple", type: "fail" },
  };
}

// ─── Regional ──────────────────────────────────────────────

export function evaluateRegional(d: FormData): ChecklistBlock {
  const enisa = evaluateENISA(d);
  const status = enisa.conclusion.status;
  const type = enisa.conclusion.type as "ok" | "fail";
  return {
    title: "Regional",
    criteria: [
      { label: "ICF", status, type },
      { label: "IVF", status, type },
      { label: "Avansa", status, type },
    ],
    conclusion: { label: "Conclusión Regional", status, type },
  };
}

// ─── Otras ayudas ──────────────────────────────────────────

export function evaluateOtras(d: FormData): ChecklistBlock {
  const faiip = d.capex_industrial === "Sí" ? { ...ok(), label: "FAIIP" } : { ...fail(), label: "FAIIP" };
  const torres = d.contratar_doctores === "Sí" ? { ...ok(), label: "Torres Quevedo" } : { ...fail(), label: "Torres Quevedo" };
  const cofides = d.internacionalizar === "Sí" ? { ...ok(), label: "Cofides" } : { ...fail(), label: "Cofides" };

  return {
    title: "Otras ayudas nacionales",
    criteria: [faiip, torres, cofides],
    conclusion: { label: "", status: "", type: "info" },
  };
}

// ─── Deducciones ───────────────────────────────────────────

export function evaluateDeducciones(d: FormData): ChecklistBlock {
  const ccaa = d.ccaa as CCAA;
  const th = ccaa ? CCAA_THRESHOLDS[ccaa] : null;
  const minGasto = th?.minGastoIdiDeducciones ?? 500000;

  const gastoN2 = d.gasto_idi_deducciones_n2 - d.gasto_subvencionado_n2;
  const gastoN1 = (d.gasto_idi_deducciones_n1 ?? d.gasto_idi_n1) - d.gasto_subvencionado_n1;
  const gastoN = (d.gasto_idi_deducciones_n ?? d.gasto_idi_n) - d.gasto_subvencionado_n;

  const df1 = ccaa === "Otro" || !ccaa ? { ...fail(), label: "DF1 — Domicilio fiscal" } : { ...ok(), label: "DF1 — Domicilio fiscal" };
  const df2 = d.ip_espana === "Sí" ? { ...ok(), label: "DF2 — PI en España" } : { ...fail(), label: "DF2 — PI en España" };
  const df3 = gastoN >= minGasto ? { ...ok(), label: "DF3 — Gasto I+D+i (N)" } : { ...fail(), label: "DF3 — Gasto I+D+i (N)" };
  const df4 = gastoN1 >= minGasto ? { ...ok(), label: "DF4 — Gasto I+D+i (N-1)" } : { ...fail(), label: "DF4 — Gasto I+D+i (N-1)" };
  const df5 = gastoN2 >= minGasto ? { ...ok(), label: "DF5 — Gasto I+D+i (N-2)" } : { ...fail(), label: "DF5 — Gasto I+D+i (N-2)" };

  let df6: CriterionResult;
  if (d.sello_pyme === "Sí") {
    df6 = { ...ok(), label: "DF6 — Sello Pyme Innovadora" };
  } else if (d.bonifica_ss === "Sí") {
    df6 = { ...warn("Lo necesita"), label: "DF6 — Sello Pyme Innovadora" };
  } else if (df3.type === "fail") {
    df6 = { ...fail(), label: "DF6 — Sello Pyme Innovadora" };
  } else {
    df6 = { label: "DF6 — Sello Pyme Innovadora", status: "—", type: "info" };
  }

  const dedOk =
    df1.type === "ok" &&
    df2.type === "ok" &&
    df3.type === "ok" &&
    df4.type === "ok" &&
    df5.type === "ok" &&
    (df6.type === "ok" || df6.type === "warning");

  return {
    title: "Deducciones fiscales I+D+i",
    criteria: [df1, df2, df3, df4, df5, df6],
    conclusion: dedOk
      ? { label: "Conclusión Deducciones", status: "OK", type: "ok" }
      : { label: "Conclusión Deducciones", status: "No cumple", type: "fail" },
  };
}

// ─── ENISA Calculator ──────────────────────────────────────

export function calcularMaximoENISA(
  fp: number,
  rating: Rating,
  tipo: "Sin histórico" | "Con histórico"
): number {
  const tabla = tipo === "Sin histórico" ? TABLA_SIN_HISTORICO : TABLA_CON_HISTORICO;
  const fila = tabla.find(r => r.rating === rating);
  if (!fila) return 0;

  let corte1: number, corte2: number;
  if (tipo === "Sin histórico") {
    corte1 = 37500;
    corte2 = 100000;
  } else {
    corte1 = 300000;
    corte2 = 1200000;
  }

  const tramo1 = Math.min(fp, corte1) * fila.apalT1;
  const tramo2 = Math.max(0, Math.min(fp, corte2) - corte1) * fila.apalT2;
  const tramo3 = Math.max(0, fp - corte2) * fila.apalT3;

  const porApalancamiento = tramo1 + tramo2 + tramo3;
  return Math.round(Math.min(1500000, fila.limiteAbsoluto, porApalancamiento));
}
