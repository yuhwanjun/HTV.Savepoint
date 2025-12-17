'use client';

import { useSaveLoad } from '@/lib/hooks/useSaveLoad';
import { useGameStore } from '@/lib/store/useGameStore';

export default function HUD() {
  const { canSave, canLoad, saveRemaining, loadRemaining, handleSave, handleLoad } = useSaveLoad();
  const inventory = useGameStore((state) => state.inventory);

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6">
      {/* Save/Load Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="btn-angular btn-save flex items-center gap-2"
        >
          <SaveIcon />
          <span>SAVE</span>
          <span className="text-xs opacity-70">({saveRemaining})</span>
        </button>

        <button
          onClick={handleLoad}
          disabled={!canLoad}
          className="btn-angular btn-load flex items-center gap-2"
        >
          <LoadIcon />
          <span>LOAD</span>
          <span className="text-xs opacity-70">({loadRemaining})</span>
        </button>
      </div>

      {/* Inventory Display */}
      {inventory.length > 0 && (
        <div className="flex justify-center gap-2">
          {inventory.map((item) => (
            <div
              key={item}
              className="px-3 py-1 text-xs uppercase tracking-wider bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              }}
            >
              {formatItemName(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Format item names for display
function formatItemName(item: string): string {
  const names: Record<string, string> = {
    sword: '검',
    bow: '활',
    staff: '지팡이',
    trap_used: '함정',
    rushed: '기습',
    observed: '관찰',
    gold: '금화',
    map: '지도',
  };
  return names[item] || item;
}

// Save Icon
function SaveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

// Load Icon
function LoadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

