import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type FormData, defaultFormData } from "./types";

const STORAGE_KEY = "premoney-form-data";

function loadFromStorage(): FormData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultFormData, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultFormData };
}

function saveToStorage(data: FormData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface StoreCtx {
  data: FormData;
  update: (partial: Partial<FormData>) => void;
  reset: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FormData>(loadFromStorage);

  useEffect(() => {
    saveToStorage(data);
  }, [data]);

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
