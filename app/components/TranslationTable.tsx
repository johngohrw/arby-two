"use client";
"use no memo";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { LocalizationState, setTranslation } from "@/lib/localization";

interface TranslationTableProps {
  state: LocalizationState;
  onStateChange: (state: LocalizationState) => void;
}

type TranslationRow = {
  key: string;
} & Record<string, string>;

const columnHelper = createColumnHelper<TranslationRow>();

export function TranslationTable({
  state,
  onStateChange,
}: TranslationTableProps) {
  const locales = state.metadata.targetLocales;

  const data = useMemo<TranslationRow[]>(() => {
    const keys = Object.keys(state.bundle).sort();
    return keys.map((key) => {
      const row: TranslationRow = { key };
      for (const locale of locales) {
        row[locale] = state.bundle[key]?.[locale] || "";
      }
      return row;
    });
  }, [state.bundle, locales]);

  const columns = useMemo(() => {
    const cols = [
      columnHelper.accessor("key", {
        header: "Key",
        cell: (info) => (
          <span className="font-mono text-xs text-gray-400">
            {info.getValue()}
          </span>
        ),
      }),
      ...locales.map((locale) =>
        columnHelper.accessor(locale, {
          header: () => (
            <span>
              {locale}
              {locale === state.metadata.sourceLocale && (
                <span className="ml-2 text-xs text-blue-400">(source)</span>
              )}
            </span>
          ),
          cell: (info) => {
            const key = info.row.original.key;
            const value = info.getValue() as string;
            return (
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newState = setTranslation(
                    state,
                    key,
                    locale,
                    e.target.value,
                  );
                  onStateChange(newState);
                }}
                placeholder="..."
                className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 -mx-2"
              />
            );
          },
        }),
      ),
    ];
    return cols;
  }, [locales, state, onStateChange]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        No translation keys. Click &quot;Fetch&quot; to load data.
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`text-left px-4 py-3 font-medium text-gray-300 border-b border-gray-700 ${
                    header.column.id === "key" ? "w-48" : "min-w-[200px]"
                  }`}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-800 hover:bg-gray-800/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
