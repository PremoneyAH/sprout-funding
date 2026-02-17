import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import type { BalanceYear } from "@/lib/types";
import { emptyBalance } from "@/lib/types";

interface BalanceUploadProps {
  onParsed: (y1: BalanceYear, y2: BalanceYear) => void;
}

const FIELD_MAP: { key: keyof BalanceYear; patterns: string[] }[] = [
  { key: "capital", patterns: ["capital"] },
  { key: "prima_emision", patterns: ["prima de emisión", "prima de emision", "prima emisión", "prima emision"] },
  { key: "reservas", patterns: ["reservas"] },
  { key: "acciones_propias", patterns: ["acciones y participaciones propias", "acciones propias", "participaciones propias"] },
  { key: "resultados_anteriores", patterns: ["resultados ejercicios anteriores", "resultados anteriores"] },
  { key: "otras_aportaciones", patterns: ["otras aportaciones de socios", "otras aportaciones"] },
  { key: "resultado_ejercicio", patterns: ["resultado del ejercicio", "resultado ejercicio"] },
  { key: "dividendo", patterns: ["dividendo a cuenta", "dividendo"] },
  { key: "otros_instrumentos", patterns: ["otros instrumentos de patrimonio", "otros instrumentos"] },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function matchField(cellText: string): keyof BalanceYear | null {
  const norm = normalize(cellText);
  for (const { key, patterns } of FIELD_MAP) {
    for (const p of patterns) {
      if (norm.includes(normalize(p))) return key;
    }
  }
  return null;
}

function parseNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[€\s.]/g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export function BalanceUpload({ onParsed }: BalanceUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const y1 = emptyBalance();
        const y2 = emptyBalance();
        let found = 0;

        for (const row of rows) {
          if (!row[0] || typeof row[0] !== "string") continue;
          const key = matchField(row[0]);
          if (!key) continue;
          found++;
          // Try col 1 for Año -1, col 2 for Año -2
          if (row.length > 1) y1[key] = parseNumber(row[1]);
          if (row.length > 2) y2[key] = parseNumber(row[2]);
        }

        if (found === 0) {
          setStatus("error");
          setMessage("No se encontraron partidas del balance en el archivo. Asegúrate de que la primera columna contiene los nombres de las partidas.");
          return;
        }

        onParsed(y1, y2);
        setStatus("success");
        setMessage(`${found} de 9 partidas encontradas y cargadas correctamente.`);
      } catch {
        setStatus("error");
        setMessage("Error al leer el archivo. Asegúrate de que es un .xlsx o .csv válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Subir Balance (.xlsx / .csv)
      </Button>
      {status !== "idle" && (
        <div className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
          status === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
        }`}>
          {status === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
          <span>{message}</span>
        </div>
      )}
      <p className="text-xs italic text-muted-foreground">
        El archivo debe tener los nombres de las partidas en la primera columna y los valores de Año -1 y Año -2 en las siguientes columnas.
      </p>
    </div>
  );
}
