import { useFormData } from "@/lib/store";
import {
  evaluateENISA,
  evaluateCDTI,
  evaluateRegional,
  evaluateOtras,
  evaluateDeducciones,
} from "@/lib/calculations";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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


  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold text-foreground">Resultados del diagnóstico</h1>
        </div>

        <ChecklistSection block={enisa} />
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
