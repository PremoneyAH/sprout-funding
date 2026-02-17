import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <div>
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {tooltip && <p className="text-xs italic text-muted-foreground mt-0.5">{tooltip}</p>}
      </div>
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
