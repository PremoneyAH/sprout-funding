import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldTooltip } from "./FieldTooltip";

interface DropdownFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  tooltip?: string;
  placeholder?: string;
}

export function DropdownField({ label, value, onChange, options, tooltip, placeholder }: DropdownFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {tooltip && <FieldTooltip text={tooltip} />}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Seleccionar..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
