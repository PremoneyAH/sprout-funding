import { createContext, useContext, useState, type ReactNode } from "react";
import { type FormData, defaultFormData } from "./types";

interface StoreCtx {
  data: FormData;
  update: (partial: Partial<FormData>) => void;
  reset: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FormData>(() => ({ ...defaultFormData }));

  const update = (partial: Partial<FormData>) =>
    setData(prev => ({ ...prev, ...partial }));

  const reset = () => setData({ ...defaultFormData });

  return <Ctx.Provider value={{ data, update, reset }}>{children}</Ctx.Provider>;
}

export function useFormData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFormData must be inside FormProvider");
  return ctx;
}
