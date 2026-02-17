import { useFormData } from "@/lib/store";
import { CCAA_LIST } from "@/lib/constants";
import { patrimonioNeto, runway } from "@/lib/calculations";
import { CurrencyInput } from "./CurrencyInput";
import { DropdownField } from "./DropdownField";
import { BalanceUpload } from "./BalanceUpload";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { BalanceYear } from "@/lib/types";

interface FormViewProps {
  onSubmit: () => void;
}

function SectionHeader({ id, title, open, onToggle }: { id: string; title: string; open: boolean; onToggle: () => void }) {
  return (
    <CollapsibleTrigger
      onClick={onToggle}
      className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors rounded-t-xl"
    >
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{id}</span>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
    </CollapsibleTrigger>
  );
}

function Section({ id, title, children, defaultOpen = false }: { id: string; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="section-card">
      <SectionHeader id={id} title={title} open={open} onToggle={() => setOpen(!open)} />
      <CollapsibleContent className="px-4 pb-6">
        <div className="pt-2 space-y-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function BalanceFields({ label, balance, onChange }: { label: string; balance: BalanceYear; onChange: (b: BalanceYear) => void }) {
  const fields: { key: keyof BalanceYear; label: string }[] = [
    { key: "capital", label: "I. Capital" },
    { key: "prima_emision", label: "II. Prima de emisión" },
    { key: "reservas", label: "III. Reservas" },
    { key: "acciones_propias", label: "IV. Acciones y participaciones propias" },
    { key: "resultados_anteriores", label: "V. Resultados ejercicios anteriores" },
    { key: "otras_aportaciones", label: "VI. Otras aportaciones de socios" },
    { key: "resultado_ejercicio", label: "VII. Resultado del ejercicio" },
    { key: "dividendo", label: "VIII. Dividendo a cuenta" },
    { key: "otros_instrumentos", label: "IX. Otros instrumentos de patrimonio" },
  ];

  const pn = patrimonioNeto(balance);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
      {fields.map(f => (
        <CurrencyInput
          key={f.key}
          label={f.label}
          value={balance[f.key]}
          onChange={v => onChange({ ...balance, [f.key]: v })}
        />
      ))}
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Total Patrimonio Neto</span>
        <span className="font-mono font-bold text-primary text-lg">{pn.toLocaleString("es-ES")} €</span>
      </div>
    </div>
  );
}

export function FormView({ onSubmit }: FormViewProps) {
  const { data, update } = useFormData();
  const rw = runway(data);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">Datos de tu empresa</h1>
          <p className="text-sm text-muted-foreground mt-1">Completa las secciones para obtener tu diagnóstico</p>
        </div>

        {/* Section A */}
        <Section id="A" title="Datos genéricos" defaultOpen>
          <DropdownField
            label="Comunidad Autónoma"
            value={data.ccaa}
            onChange={v => update({ ccaa: v as any })}
            options={[...CCAA_LIST]}
            tooltip="Selecciona la CCAA donde tenéis el domicilio fiscal de la sociedad"
          />
          <DropdownField
            label="¿Auditáis cuentas anuales?"
            value={data.audita}
            onChange={v => update({ audita: v as any })}
            options={["Sí", "No"]}
            tooltip="¿La empresa presenta cuentas anuales auditadas?"
          />
          <CurrencyInput
            label="Caja en banco actual"
            value={data.caja}
            onChange={v => update({ caja: v })}
            tooltip="Importe de tesorería disponible hoy en cuentas bancarias"
          />
          <CurrencyInput
            label="Gasto mensual promedio (últimos 3 meses)"
            value={data.gasto_mensual}
            onChange={v => update({ gasto_mensual: v })}
            tooltip="Gasto operativo mensual medio de los últimos 3 meses, sin contar financiación"
          />
          <div className="space-y-1.5">
            <div>
              <Label className="text-sm font-medium text-foreground">Runway (meses)</Label>
              <p className="text-xs italic text-muted-foreground mt-0.5">Meses de supervivencia con la caja actual. Puedes sobreescribirlo manualmente.</p>
            </div>
            <Input
              type="number"
              value={data.runway_override ?? (rw || "")}
              onChange={e => {
                const v = e.target.value;
                update({ runway_override: v ? Number(v) : null });
              }}
              className="font-mono"
              placeholder={String(rw)}
            />
            <p className="text-xs text-muted-foreground">Calculado: {rw.toFixed(2)} meses</p>
          </div>
        </Section>

        {/* Section B */}
        <Section id="B" title="Balance de Situación">
          <BalanceUpload
            onParsed={(y1, y2) => update({ balance_y1: y1, balance_y2: y2 })}
          />
          <p className="text-xs italic text-muted-foreground">
            Si no tenéis Año -2, déjalo a 0. Introduce los datos de Año -1 y Año -2
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <BalanceFields
              label="Año -1"
              balance={data.balance_y1}
              onChange={b => update({ balance_y1: b })}
            />
            <BalanceFields
              label="Año -2"
              balance={data.balance_y2}
              onChange={b => update({ balance_y2: b })}
            />
          </div>
        </Section>

        {/* Section C */}
        <Section id="C" title="Datos ENISA">
          <div className="space-y-1.5">
            <div>
              <Label className="text-sm font-medium text-foreground">Fecha última ampliación de capital</Label>
              <p className="text-xs italic text-muted-foreground mt-0.5">Fecha del último aumento de capital social registrado</p>
            </div>
            <Input
              type="date"
              value={data.fecha_ampliacion}
              onChange={e => update({ fecha_ampliacion: e.target.value })}
            />
          </div>
          <CurrencyInput
            label="Importe última ampliación"
            value={data.importe_ampliacion}
            onChange={v => update({ importe_ampliacion: v })}
            tooltip="Importe en euros de la última ampliación"
          />
          <CurrencyInput
            label="Notas convertibles pendientes"
            value={data.notas_convertibles}
            onChange={v => update({ notas_convertibles: v })}
            tooltip="Si tienes notas convertibles pendientes de convertir, indica el importe. Si no, pon 0"
          />
          <div className="space-y-1.5">
            <div>
              <Label className="text-sm font-medium text-foreground">Fecha conversión notas</Label>
              <p className="text-xs italic text-muted-foreground mt-0.5">Fecha prevista de conversión. Si no aplica, dejar vacío</p>
            </div>
            <Input
              type="date"
              value={data.fecha_conversion_notas}
              onChange={e => update({ fecha_conversion_notas: e.target.value })}
            />
          </div>
          <DropdownField
            label="¿Revenue devengado al menos 6 meses?"
            value={data.tiene_revenue}
            onChange={v => update({ tiene_revenue: v as any })}
            options={["Sí", "No"]}
            tooltip="¿La compañía ha generado ingresos durante al menos 6 meses consecutivos?"
          />
          <DropdownField
            label="¿Aplicáis tax lease?"
            value={data.tax_lease}
            onChange={v => update({ tax_lease: v as any })}
            options={["Sí", "No"]}
            tooltip="Si no sabes qué es el tax lease, probablemente no lo aplicáis. Selecciona No."
          />
          <DropdownField
            label="¿Riesgo vivo con ENISA?"
            value={data.riesgo_vivo_enisa}
            onChange={v => update({ riesgo_vivo_enisa: v as any })}
            options={["Sí", "No"]}
            tooltip="¿Tenéis un préstamo activo con ENISA actualmente?"
          />
          {data.riesgo_vivo_enisa === "Sí" && (
            <CurrencyInput
              label="Riesgo vivo ENISA en Balance"
              value={data.riesgo_vivo_balance}
              onChange={v => update({ riesgo_vivo_balance: v })}
              tooltip="Importe del préstamo vivo con ENISA en balance"
            />
          )}
        </Section>

        {/* Section D */}
        <Section id="D" title="Datos CDTI">
          <p className="text-xs text-muted-foreground">Introduce los datos para N-1 (año anterior) y N (año actual)</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">N-1</h4>
              <CurrencyInput label="Gasto total I+D+i" value={data.gasto_idi_n1} onChange={v => update({ gasto_idi_n1: v })} />
              <CurrencyInput label="Gasto in-house" value={data.gasto_inhouse_n1} onChange={v => update({ gasto_inhouse_n1: v })} />
              <div className="text-xs text-muted-foreground">
                Gasto terceros: <span className="font-mono">{(data.gasto_idi_n1 - data.gasto_inhouse_n1).toLocaleString("es-ES")} €</span>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">N</h4>
              <CurrencyInput label="Gasto total I+D+i" value={data.gasto_idi_n} onChange={v => update({ gasto_idi_n: v })} />
              <CurrencyInput label="Gasto in-house" value={data.gasto_inhouse_n} onChange={v => update({ gasto_inhouse_n: v })} />
              <div className="text-xs text-muted-foreground">
                Gasto terceros: <span className="font-mono">{(data.gasto_idi_n - data.gasto_inhouse_n).toLocaleString("es-ES")} €</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Section E */}
        <Section id="E" title="Otras ayudas nacionales">
          <DropdownField
            label="¿CAPEX Industrial?"
            value={data.capex_industrial}
            onChange={v => update({ capex_industrial: v as any })}
            options={["Sí", "No"]}
          />
          <DropdownField
            label="¿Vas a contratar doctores?"
            value={data.contratar_doctores}
            onChange={v => update({ contratar_doctores: v as any })}
            options={["Sí", "No"]}
          />
          <DropdownField
            label="¿La compañía va a internacionalizarse?"
            value={data.internacionalizar}
            onChange={v => update({ internacionalizar: v as any })}
            options={["Sí", "No"]}
          />
        </Section>

        {/* Section F */}
        <Section id="F" title="Deducciones fiscales I+D+i">
          <p className="text-xs text-muted-foreground">Los valores N-1 y N se pre-rellenan desde la Sección D. Puedes sobreescribirlos.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">N-2</h4>
              <CurrencyInput
                label="Gasto I+D+i"
                value={data.gasto_idi_deducciones_n2}
                onChange={v => update({ gasto_idi_deducciones_n2: v })}
              />
              <CurrencyInput
                label="Gasto subvencionado"
                value={data.gasto_subvencionado_n2}
                onChange={v => update({ gasto_subvencionado_n2: v })}
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">N-1</h4>
              <CurrencyInput
                label="Gasto I+D+i"
                value={data.gasto_idi_deducciones_n1 ?? data.gasto_idi_n1}
                onChange={v => update({ gasto_idi_deducciones_n1: v })}
              />
              <CurrencyInput
                label="Gasto subvencionado"
                value={data.gasto_subvencionado_n1}
                onChange={v => update({ gasto_subvencionado_n1: v })}
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">N</h4>
              <CurrencyInput
                label="Gasto I+D+i"
                value={data.gasto_idi_deducciones_n ?? data.gasto_idi_n}
                onChange={v => update({ gasto_idi_deducciones_n: v })}
              />
              <CurrencyInput
                label="Gasto subvencionado"
                value={data.gasto_subvencionado_n}
                onChange={v => update({ gasto_subvencionado_n: v })}
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <div>Gasto neto N-2: <span className="font-mono">{(data.gasto_idi_deducciones_n2 - data.gasto_subvencionado_n2).toLocaleString("es-ES")} €</span></div>
            <div>Gasto neto N-1: <span className="font-mono">{((data.gasto_idi_deducciones_n1 ?? data.gasto_idi_n1) - data.gasto_subvencionado_n1).toLocaleString("es-ES")} €</span></div>
            <div>Gasto neto N: <span className="font-mono">{((data.gasto_idi_deducciones_n ?? data.gasto_idi_n) - data.gasto_subvencionado_n).toLocaleString("es-ES")} €</span></div>
          </div>

          <DropdownField
            label="¿Propiedad intelectual en España?"
            value={data.ip_espana}
            onChange={v => update({ ip_espana: v as any })}
            options={["Sí", "No"]}
          />
          <DropdownField
            label="¿Bonifica Seguridad Social?"
            value={data.bonifica_ss}
            onChange={v => update({ bonifica_ss: v as any })}
            options={["Sí", "No"]}
          />
          <DropdownField
            label="¿Tiene sello Pyme Innovadora?"
            value={data.sello_pyme}
            onChange={v => update({ sello_pyme: v as any })}
            options={["Sí", "No"]}
          />
        </Section>

        {/* Submit */}
        <Button
          onClick={onSubmit}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-14 rounded-xl"
        >
          Ver resultados
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
