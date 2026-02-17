export const CCAA_LIST = [
  "Galicia", "Asturias", "Cantabria", "País Vasco", "Navarra", "Cataluña",
  "Castilla León", "La Rioja", "Aragón", "Comunidad Autónoma de Valencia",
  "Extremadura", "Madrid", "Castilla la Mancha", "Andalucía", "Murcia",
  "Canarias", "Baleares", "Otro"
] as const;

export type CCAA = typeof CCAA_LIST[number];

export interface CcaaThresholds {
  runwayMin: number;
  mesesMaxAmpliacion: number;
  importeMinAmpliacion: number;
  maxRiesgoSinAuditar: number;
  maxRiesgoAuditando: number;
  minGastoIdiCdti: number;
  minGastoIdiDeducciones: number;
}

const defaultThresholds: CcaaThresholds = {
  runwayMin: 6,
  mesesMaxAmpliacion: 6,
  importeMinAmpliacion: 100000,
  maxRiesgoSinAuditar: 300000,
  maxRiesgoAuditando: 1200000,
  minGastoIdiCdti: 250000,
  minGastoIdiDeducciones: 500000,
};

export const CCAA_THRESHOLDS: Record<CCAA, CcaaThresholds> = Object.fromEntries(
  CCAA_LIST.map(ccaa => [
    ccaa,
    {
      ...defaultThresholds,
      runwayMin: ccaa === "Cantabria" || ccaa === "Madrid" ? 12 : 6,
    },
  ])
) as Record<CCAA, CcaaThresholds>;

export type Rating = "A1" | "A2" | "A3" | "B1" | "B2" | "B3" | "C1" | "C2" | "C3";
export const RATINGS: Rating[] = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];

export interface RatingRow {
  rating: Rating;
  limiteAbsoluto: number;
  apalT1: number;
  apalT2: number;
  apalT3: number;
}

export const TABLA_SIN_HISTORICO: RatingRow[] = [
  { rating: "A1", limiteAbsoluto: 300000, apalT1: 2.00, apalT2: 1.20, apalT3: 0.75 },
  { rating: "A2", limiteAbsoluto: 285000, apalT1: 1.95, apalT2: 1.15, apalT3: 0.70 },
  { rating: "A3", limiteAbsoluto: 270000, apalT1: 1.90, apalT2: 1.10, apalT3: 0.65 },
  { rating: "B1", limiteAbsoluto: 255000, apalT1: 1.85, apalT2: 1.05, apalT3: 0.50 },
  { rating: "B2", limiteAbsoluto: 240000, apalT1: 1.80, apalT2: 1.00, apalT3: 0.55 },
  { rating: "B3", limiteAbsoluto: 225000, apalT1: 1.75, apalT2: 0.95, apalT3: 0.50 },
  { rating: "C1", limiteAbsoluto: 210000, apalT1: 1.70, apalT2: 0.90, apalT3: 0.45 },
  { rating: "C2", limiteAbsoluto: 195000, apalT1: 1.65, apalT2: 0.85, apalT3: 0.40 },
  { rating: "C3", limiteAbsoluto: 180000, apalT1: 1.60, apalT2: 0.80, apalT3: 0.30 },
];

export const TABLA_CON_HISTORICO: RatingRow[] = [
  { rating: "A1", limiteAbsoluto: 1500000, apalT1: 1.00, apalT2: 0.67, apalT3: 0.33 },
  { rating: "A2", limiteAbsoluto: 1335000, apalT1: 0.98, apalT2: 0.65, apalT3: 0.31 },
  { rating: "A3", limiteAbsoluto: 1170000, apalT1: 0.96, apalT2: 0.63, apalT3: 0.29 },
  { rating: "B1", limiteAbsoluto: 1005000, apalT1: 0.94, apalT2: 0.61, apalT3: 0.27 },
  { rating: "B2", limiteAbsoluto: 840000,  apalT1: 0.92, apalT2: 0.59, apalT3: 0.25 },
  { rating: "B3", limiteAbsoluto: 675000,  apalT1: 0.90, apalT2: 0.57, apalT3: 0.23 },
  { rating: "C1", limiteAbsoluto: 510000,  apalT1: 0.88, apalT2: 0.55, apalT3: 0.21 },
  { rating: "C2", limiteAbsoluto: 345000,  apalT1: 0.86, apalT2: 0.53, apalT3: 0.19 },
  { rating: "C3", limiteAbsoluto: 180000,  apalT1: 0.84, apalT2: 0.51, apalT3: 0.17 },
];

export const DISCLAIMER = `Este documento se facilita como referencia y plantilla. La información y los cálculos proporcionados en esta herramienta (la "Plantilla") son solo para fines informativos generales. Toda la información y los cálculos en esta Plantilla se proporcionan de buena fe, sin embargo, Premoney y Alberto Hospital no hacen ninguna representación ni garantía de ningún tipo, expresa o implícita, con respecto a la exactitud, adecuación, validez, fiabilidad, disponibilidad o integridad de cualquier información y cálculos en esta Plantilla. BAJO NINGUNA CIRCUNSTANCIA TENDREMOS RESPONSABILIDAD ALGUNA HACIA TI POR CUALQUIER PÉRDIDA O DAÑO DE CUALQUIER TIPO INCURRIDO COMO RESULTADO DEL USO DE LA PLANTILLA O LA CONFIANZA EN CUALQUIER INFORMACIÓN Y CÁLCULO PROPORCIONADO EN ESTA PLANTILLA. EL USO QUE HAGAS DE LA PLANTILLA Y SU CONFIANZA EN CUALQUIER INFORMACIÓN Y CÁLCULO EN ESTA PLANTILLA ES ÚNICAMENTE BAJO TU PROPIO RIESGO.

La Plantilla no puede y no contiene asesoramiento financiero. La información financiera se proporciona solo para fines informativos y educativos generales y no es un sustituto del asesoramiento profesional. En consecuencia, antes de tomar cualquier acción basada en dicha información, te recomendamos que consultes con los profesionales apropiados. EL USO O LA CONFIANZA EN CUALQUIER INFORMACIÓN CONTENIDA EN ESTA PLANTILLA ES ÚNICAMENTE BAJO TU PROPIO RIESGO.`;
