"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSaveLoad } from "@/lib/hooks/useSaveLoad";
import { useGameStore, Snapshot } from "@/lib/store/useGameStore";

export default function HUD() {
  const router = useRouter();
  const resetGame = useGameStore((state) => state.resetGame);
  const {
    canSave,
    canLoad,
    saveRemaining,
    loadRemaining,
    savedSnapshots,
    handleSave,
    handleLoad,
  } = useSaveLoad();
  const inventory = useGameStore((state) => state.inventory);

  const [isLoadDropdownOpen, setIsLoadDropdownOpen] = useState(false);
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLoadDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLoadSelect = (snapshotId: string) => {
    handleLoad(snapshotId);
    setIsLoadDropdownOpen(false);
  };

  const handleGoHome = () => {
    setIsHomeModalOpen(true);
  };

  const confirmGoHome = () => {
    resetGame();
    setIsHomeModalOpen(false);
    router.push("/");
  };

  const cancelGoHome = () => {
    setIsHomeModalOpen(false);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Top Left - Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={handleGoHome}
          className="home-btn"
          title="처음으로 돌아가기"
        >
          <HomeIcon />
        </button>
      </div>

      {/* Top Right - Save/Load Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`save-load-btn save-btn ${canSave ? "active" : ""}`}
          title={canSave ? "현재 상태 저장" : "저장 불가"}
        >
          <SaveIcon />
          <span className="save-load-count">{saveRemaining}</span>
        </button>

        {/* Load Button with Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onMouseEnter={() =>
              canLoad &&
              savedSnapshots.length > 0 &&
              setIsLoadDropdownOpen(true)
            }
            onClick={() =>
              canLoad &&
              savedSnapshots.length > 0 &&
              setIsLoadDropdownOpen(!isLoadDropdownOpen)
            }
            disabled={!canLoad || savedSnapshots.length === 0}
            className={`save-load-btn load-btn ${
              canLoad && savedSnapshots.length > 0 ? "active" : ""
            }`}
            title={canLoad ? "저장 지점으로 복귀" : "로드 불가"}
          >
            <LoadIcon />
            <span className="save-load-count">{loadRemaining}</span>
          </button>

          {/* Load Dropdown */}
          {isLoadDropdownOpen && savedSnapshots.length > 0 && (
            <div
              className="absolute top-full right-0 mt-2 w-56 panel-angular p-2 z-30"
              onMouseLeave={() => setIsLoadDropdownOpen(false)}
            >
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider px-2 py-1 mb-1">
                저장된 지점
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {savedSnapshots.map((snapshot, index) => (
                  <SnapshotItem
                    key={snapshot.id}
                    snapshot={snapshot}
                    index={index}
                    onSelect={onLoadSelect}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom - Inventory Display */}
      {inventory.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {inventory.map((item) => (
            <div
              key={item}
              className="px-3 py-1 text-xs uppercase tracking-wider bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
              style={{
                clipPath:
                  "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
              }}
            >
              {formatItemName(item)}
            </div>
          ))}
        </div>
      )}

      {/* Home Confirmation Modal */}
      {isHomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cancelGoHome}
          />
          {/* Modal */}
          <div
            className="relative panel-angular p-6 mx-4 max-w-sm w-full"
            style={{
              animation: "modalFadeIn 0.2s ease-out",
            }}
          >
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
              홈화면으로 돌아가기
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              홈화면으로 돌아가시겠습니까?
              <br />
              <span className="text-[var(--color-accent)]">
                (진행 상황이 전부 초기화 됩니다)
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelGoHome}
                className="flex-1 px-4 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                style={{
                  clipPath:
                    "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                }}
              >
                취소
              </button>
              <button
                onClick={confirmGoHome}
                className="flex-1 px-4 py-2 text-sm bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-bg-primary)] hover:bg-[var(--color-accent-hover)] transition-colors font-medium"
                style={{
                  clipPath:
                    "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .home-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(45, 31, 23, 0.7);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          clip-path: polygon(
            0 0,
            calc(100% - 6px) 0,
            100% 6px,
            100% 100%,
            6px 100%,
            0 calc(100% - 6px)
          );
        }

        .home-btn:hover {
          background: rgba(74, 55, 40, 0.9);
          color: var(--color-text-primary);
          border-color: var(--color-accent);
        }

        .save-load-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(45, 31, 23, 0.9);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          clip-path: polygon(
            0 0,
            calc(100% - 8px) 0,
            100% 8px,
            100% 100%,
            8px 100%,
            0 calc(100% - 8px)
          );
        }

        .save-load-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-load-btn.active {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .save-btn.active {
          border-color: #7eb87e;
          box-shadow: 0 0 10px rgba(126, 184, 126, 0.3);
        }

        .save-btn.active:hover {
          background: rgba(74, 55, 40, 0.95);
          box-shadow: 0 0 20px rgba(126, 184, 126, 0.5);
        }

        .load-btn.active {
          border-color: #7eb8d4;
          box-shadow: 0 0 10px rgba(126, 184, 212, 0.3);
        }

        .load-btn.active:hover {
          background: rgba(74, 55, 40, 0.95);
          box-shadow: 0 0 20px rgba(126, 184, 212, 0.5);
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .save-load-count {
          position: absolute;
          bottom: 2px;
          right: 4px;
          font-size: 10px;
          font-family: "Geist Mono", monospace;
          color: var(--color-text-muted);
        }
      `}</style>
    </>
  );
}

// Snapshot Item Component
function SnapshotItem({
  snapshot,
  index,
  onSelect,
  formatTime,
}: {
  snapshot: Snapshot;
  index: number;
  onSelect: (id: string) => void;
  formatTime: (timestamp: number) => string;
}) {
  return (
    <button
      onClick={() => onSelect(snapshot.id)}
      className="w-full text-left px-3 py-2 hover:bg-[var(--color-bg-tertiary)] transition-colors rounded"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-accent)] font-mono">
          #{index + 1}
        </span>
        <span className="text-sm text-[var(--color-text-primary)] truncate flex-1">
          {snapshot.nodeTitle}
        </span>
      </div>
      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
        {formatTime(snapshot.timestamp)}
      </div>
    </button>
  );
}

// Format item names for display
function formatItemName(item: string): string {
  const names: Record<string, string> = {
    sword: "검",
    bow: "활",
    staff: "지팡이",
    trap_used: "함정",
    rushed: "기습",
    observed: "관찰",
    gold: "금화",
    map: "지도",
  };
  return names[item] || item;
}

// Home Icon
function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

// Save Icon
function SaveIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
