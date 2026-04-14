"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocalizationState } from "@/lib/localization";
import { GitlabConfig, gitlabConfigSchema } from "@/lib/gitlab-config";
import { Toolbar } from "./components/Toolbar";
import { Sidebar } from "./components/Sidebar";
import { TranslationTable } from "./components/TranslationTable";
import { BottomBar } from "./components/BottomBar";

// Demo versions
const VERSIONS = ["v1.0.0", "v1.1.0", "v2.0.0"];

// Empty initial state
const EMPTY_STATE: LocalizationState = {
  bundle: {},
  metadata: {
    sourceLocale: "en",
    targetLocales: ["en", "es", "fr"],
  },
};

// Demo data for fetch simulation
const DEMO_STATE: LocalizationState = {
  bundle: {
    helloWorld: {
      en: "Hello World",
      es: "Hola Mundo",
      fr: "Bonjour le monde",
    },
    welcomeMessage: {
      en: "Welcome to our app",
      es: "Bienvenido a nuestra aplicación",
      fr: "Bienvenue dans notre application",
    },
    saveButton: {
      en: "Save",
      es: "Guardar",
      fr: "Enregistrer",
    },
    cancelButton: {
      en: "Cancel",
      es: "Cancelar",
      fr: "Annuler",
    },
  },
  metadata: {
    sourceLocale: "en",
    targetLocales: ["en", "es", "fr"],
    lastModified: new Date(),
  },
};

export default function Home() {
  const [version, setVersion] = useState(VERSIONS[0]);
  const [state, setState] = useState<LocalizationState>(EMPTY_STATE);
  const [isDirty, setIsDirty] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GitlabConfig>({
    resolver: zodResolver(gitlabConfigSchema),
    defaultValues: {
      endpoint: "",
      projectId: "",
      arbFilepaths: "",
      accessToken: "",
    },
    mode: "onChange",
  });

  const onFetch = (data: GitlabConfig) => {
    // TODO: use validated `data` for actual GitLab fetch
    console.log("Fetching with config:", data);
    setState(DEMO_STATE);
    setIsDirty(false);
  };

  const handleImport = () => {
    // Placeholder for import functionality
    alert("Import from sheet - TBD");
  };

  const handleStateChange = (newState: LocalizationState) => {
    setState(newState);
    setIsDirty(true);
  };

  const handleUpdate = () => {
    // Placeholder for update/save functionality
    console.log("Saving state:", state);
    setIsDirty(false);
    alert("Changes saved!");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      {/* Top Toolbar */}
      <Toolbar
        version={version}
        versions={VERSIONS}
        onVersionChange={setVersion}
        onFetch={handleSubmit(onFetch)}
        onImport={handleImport}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Sidebar */}
      <Sidebar register={register} errors={errors} isOpen={sidebarOpen} />

      {/* Main Content */}
      <main
        className={`pt-14 pb-14 transition-all duration-200 ${
          sidebarOpen ? "pl-64" : "pl-0"
        }`}
      >
        <TranslationTable state={state} onStateChange={handleStateChange} />
      </main>

      {/* Bottom Toolbar */}
      <BottomBar onUpdate={handleUpdate} isDirty={isDirty} />
    </div>
  );
}
