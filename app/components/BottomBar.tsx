"use client";

interface BottomBarProps {
  onUpdate: () => void;
  isDirty?: boolean;
}

export function BottomBar({ onUpdate, isDirty = false }: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-gray-900 border-t border-gray-800 flex items-center justify-end px-4 z-50">
      {isDirty && (
        <span className="mr-4 text-sm text-amber-400">Unsaved changes</span>
      )}
      <button
        onClick={onUpdate}
        className="bg-green-600 hover:bg-green-500 text-white text-sm px-6 py-2 rounded transition-colors font-medium"
      >
        Update
      </button>
    </div>
  );
}
