import { DISCLAIMER } from "@/lib/constants";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-display font-extrabold text-2xl mb-6">
            P
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            PLANTILLA DE FINANCIACIÓN PÚBLICA
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Herramienta de auto-diagnóstico para identificar opciones de financiación pública y deducciones fiscales
          </p>
        </div>

        {/* Steps */}
        <div className="section-card p-6 mb-8">
          <h2 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Cómo funciona</h2>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-foreground">Introduce los datos de tu empresa en el formulario</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-foreground">Consulta el checklist automático de resultados</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-foreground">Interpreta los resultados con la leyenda de colores</span>
            </li>
          </ol>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Leyenda</h3>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm status-ok rounded-md px-3 py-1">
                <CheckCircle className="h-3.5 w-3.5" /> Cumple
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm status-fail rounded-md px-3 py-1">
                <XCircle className="h-3.5 w-3.5" /> No cumple
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm status-warning rounded-md px-3 py-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Acción necesaria
              </span>
            </div>
          </div>
        </div>

        {/* Lines evaluated */}
        <div className="section-card p-6 mb-8">
          <h2 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Líneas evaluadas</h2>
          <div className="flex flex-wrap gap-2">
            {["ENISA", "CDTI", "Regional (ICF, IVF, Avansa)", "FAIIP", "Torres Quevedo", "Cofides", "Deducciones I+D+i"].map(line => (
              <span key={line} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                {line}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onStart}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-14 rounded-xl"
        >
          Comenzar diagnóstico
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
