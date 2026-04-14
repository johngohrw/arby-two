"use client";

interface ToolbarProps {
  version: string;
  versions: string[];
  onVersionChange: (version: string) => void;
  onFetch: React.MouseEventHandler<HTMLButtonElement>;
  onImport: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Toolbar({
  version,
  versions,
  onVersionChange,
  onFetch,
  onImport,
  sidebarOpen,
  onToggleSidebar,
}: ToolbarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-6 z-50">
      {/* Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${sidebarOpen ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-700" />

      {/* Arguments Group */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Arguments</span>
        <select
          value={version}
          onChange={(e) => onVersionChange(e.target.value)}
          className="bg-gray-800 text-gray-200 text-sm rounded px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          {versions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Actions Group */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Actions</span>
        <button
          onClick={onFetch}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
        >
          Fetch
        </button>
        <button
          onClick={onImport}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-4 py-1.5 rounded transition-colors"
        >
          Import from sheet
        </button>
      </div>
    </div>
  );
}
