import { useState } from "react";
import { FormProvider } from "@/lib/store";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { FormView } from "@/components/FormView";
import { ResultsView } from "@/components/ResultsView";

type View = "welcome" | "form" | "results";

const Index = () => {
  const [view, setView] = useState<View>("welcome");

  return (
    <FormProvider>
      {view === "welcome" && <WelcomeScreen onStart={() => setView("form")} />}
      {view === "form" && <FormView onSubmit={() => setView("results")} />}
      {view === "results" && <ResultsView onBack={() => setView("form")} />}
    </FormProvider>
  );
};

export default Index;
