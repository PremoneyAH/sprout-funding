import { useFormData } from "@/lib/store";
import {
  evaluateENISA,
  evaluateCDTI,
  evaluateRegional,
  evaluateOtras,
  evaluateDeducciones,
  calcularMaximoENISA,
  patrimonioNeto,
} from "@/lib/calculations";
import { RATINGS, type Rating } from "@/lib/constants";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { ChecklistBlock, CriterionResult } from "@/lib/types";
import { DISCLAIMER } from "@/lib/constants";

interface ResultsViewProps {
  onBack: () => void;
}

function ChecklistSection({ block }: { block: ChecklistBlock }) {
  return (
    <div className="section-card overflow-hidden">
      <div className="bg-primary px-4 py-3">
        <h3 className="font-bold text-primary-foreground">{block.title}</h3>
      </div>
      <div className="divide-y divide-border">
        {block.criteria.map((c, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-foreground font-medium">{c.label}</span>
            <StatusBadge result={c} />
          </div>
        ))}
        {block.conclusion.label && (
          <div className="flex items-center justify-between px-4 py-4 bg-muted/50">
            <span className="text-sm font-bold text-foreground">{block.conclusion.label}</span>
            <StatusBadge result={block.conclusion} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ResultsView({ onBack }: ResultsViewProps) {
  const { data } = useFormData();
  const enisa = evaluateENISA(data);
  const cdti = evaluateCDTI(data);
  const regional = evaluateRegional(data);
  const otras = evaluateOtras(data);
  const deducciones = evaluateDeducciones(data);

  const pnY1 = patrimonioNeto(data.balance_y1);
  const fpComputable = pnY1 + data.importe_ampliacion;

  const [rating, setRating] = useState<Rating>("B1");
  const [tipo, setTipo] = useState<"Sin histórico" | "Con histórico">("Sin histórico");
  const [fpOverride, setFpOverride] = useState<number>(fpComputable);

  const enisaOk = enisa.conclusion.type === "ok";
  const maxEnisa = enisaOk ? calcularMaximoENISA(fpOverride, rating, tipo) : 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold text-foreground">Resultados del diagnóstico</h1>
        </div>

        <ChecklistSection block={enisa} />

        {/* ENISA Calculator */}
        <div className="section-card overflow-hidden">
          <div className="bg-primary px-4 py-3">
            <h3 className="font-bold text-primary-foreground">Importe máximo ENISA</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Fondos Propios</Label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    value={fpOverride}
                    onChange={e => setFpOverride(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Rating</Label>
                <Select value={rating} onValueChange={v => setRating(v as Rating)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RATINGS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Tipo empresa</Label>
                <Select value={tipo} onValueChange={v => setTipo(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sin histórico">Sin histórico</SelectItem>
                    <SelectItem value="Con histórico">Con histórico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-semibold text-foreground">Importe máximo</span>
              <span className="font-mono font-bold text-2xl text-primary">
                {maxEnisa.toLocaleString("es-ES")} €
              </span>
            </div>
            {!enisaOk && (
              <p className="text-xs text-destructive">La empresa no cumple los requisitos de ENISA. Importe = 0 €</p>
            )}
          </div>
        </div>

        <ChecklistSection block={cdti} />
        <ChecklistSection block={regional} />
        <ChecklistSection block={otras} />
        <ChecklistSection block={deducciones} />

        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="w-full font-bold text-base h-14 rounded-xl"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Modificar datos
        </Button>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
