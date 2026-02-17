import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldTooltip } from "./FieldTooltip";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tooltip?: string;
  disabled?: boolean;
}

export function CurrencyInput({ label, value, onChange, tooltip, disabled }: CurrencyInputProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {tooltip && <FieldTooltip text={tooltip} />}
      </Label>
      <div className="relative">
        <Input
          type="number"
          min={0}
          value={value || ""}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="pr-8 font-mono"
          disabled={disabled}
          placeholder="0"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
      </div>
    </div>
  );
}
