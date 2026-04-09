"use client";

import { useState } from "react";
import { LocalizationState } from "@/lib/localization";
import { Toolbar } from "./components/Toolbar";
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

  const handleFetch = () => {
    // Simulate fetching data
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
        onFetch={handleFetch}
        onImport={handleImport}
      />

      {/* Main Content */}
      <main className="pt-14 pb-14">
        <TranslationTable state={state} onStateChange={handleStateChange} />
      </main>

      {/* Bottom Toolbar */}
      <BottomBar onUpdate={handleUpdate} isDirty={isDirty} />
    </div>
  );
}
