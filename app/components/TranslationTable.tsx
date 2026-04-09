"use client";

import { LocalizationState, setTranslation } from "@/lib/localization";

interface TranslationTableProps {
  state: LocalizationState;
  onStateChange: (state: LocalizationState) => void;
}

export function TranslationTable({ state, onStateChange }: TranslationTableProps) {
  const keys = Object.keys(state.bundle).sort();
  const locales = state.metadata.targetLocales;

  const handleCellChange = (key: string, locale: string, value: string) => {
    const newState = setTranslation(state, key, locale, value);
    onStateChange(newState);
  };

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 sticky top-0">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-300 border-b border-gray-700 w-48">
              Key
            </th>
            {locales.map((locale) => (
              <th
                key={locale}
                className="text-left px-4 py-3 font-medium text-gray-300 border-b border-gray-700 min-w-[200px]"
              >
                {locale}
                {locale === state.metadata.sourceLocale && (
                  <span className="ml-2 text-xs text-blue-400">(source)</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.length === 0 ? (
            <tr>
              <td
                colSpan={locales.length + 1}
                className="px-4 py-8 text-center text-gray-500"
              >
                No translation keys. Click &quot;Fetch&quot; to load data.
              </td>
            </tr>
          ) : (
            keys.map((key) => (
              <tr key={key} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-2 font-mono text-xs text-gray-400">
                  {key}
                </td>
                {locales.map((locale) => (
                  <td key={`${key}-${locale}`} className="px-4 py-2">
                    <input
                      type="text"
                      value={state.bundle[key]?.[locale] || ""}
                      onChange={(e) =>
                        handleCellChange(key, locale, e.target.value)
                      }
                      placeholder="..."
                      className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 -mx-2"
                    />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
