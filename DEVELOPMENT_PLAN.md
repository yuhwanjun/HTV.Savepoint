# [CURSOR PLAN] Save & Load Tower: Interactive Point Cloud Game

## 1. Project Context

- **Title:** Save Point (Interactive Exhibition Content)
- **Platform:** Web-based Kiosk (Next.js)
- **Display:** Vertical 9:16 (Portrait TV)
- **Tech Stack:** Next.js 14, Three.js, @react-three/fiber, @react-three/drei, Zustand, Tailwind CSS.
- **Key Visual:** Unstable, memory-like Point Clouds (.ply / .pcd).

---

## 2. Technical Architecture

### 2.1 State Management (Zustand)

`lib/store/useGameStore.ts`

- **Game State:** `runId`, `currentNodeId`, `inventory`, `history`.
- **Resources:** `saveRemaining` (2), `loadRemaining` (1).
- **Snapshot:** `savedSnapshot` (Store current node, camera transform, and flags).

### 2.2 Scene Node System

`lib/game/nodes.ts`

- 정의된 노드 리스트를 순회하며 Three.js Scene을 교체.
- **Node Types:** `explore`, `choice`, `chance`, `ending`.
- **Property:** `allowSave: boolean`, `allowLoad: boolean`.

---

## 3. Implementation Steps

### Step 1: Core Layout & Canvas Setup

- `app/layout.tsx`: 9:16 비율 고정 및 배경색 설정.
- `components/canvas/SceneContainer.tsx`: R3F `Canvas` 설정 및 `Responsive` 카메라 세팅.

### Step 2: Point Cloud Loader & Scene Manager

- `components/canvas/PointCloudModel.tsx`: `.ply` 파일을 로드하고 `PointsMaterial` 적용.
- `components/canvas/SceneManager.tsx`: `useGameStore`의 `currentNodeId`를 구독하여 현재 Phase 컴포넌트를 렌더링.

### Step 3: Interaction & Hotspots

- `components/canvas/Hotspot.tsx`: 3D 공간 내 클릭 가능한 투명 Mesh. 마우스 호버 시 포인트 밀도 변화 효과.
- `hooks/useInteraction.ts`: 클릭 시 다음 노드로 전환 및 `history` 기록 로직.

### Step 4: Save/Load System

- **Save Logic:** 현재 상태(Camera Pose 포함)를 스토어에 복사. `saveRemaining` 감소.
- **Load Logic:** `savedSnapshot` 데이터를 현재 상태로 복원. 카메라 위치 `lerp` 이동. `loadRemaining` 감소.

### Step 5: Classification & Result

- `lib/game/classify.ts`: `history`와 세이브 시점을 분석해 4가지 타입(Shield, Vault, Gamble, Flow) 중 하나 반환.
- `app/result/page.tsx`: 최종 타입 및 내러티브 텍스트 출력.

---

## 4. Phase Outline (Scene Nodes)

| Phase  | Title         | Logic                           | Save/Load        |
| ------ | ------------- | ------------------------------- | ---------------- |
| **P1** | Beginning     | Weapon Select (Sword, Bow, etc) | Save Allowed     |
| **P2** | Before Battle | Choice: Prepare vs Rush         | Save Allowed     |
| **P3** | After Victory | Looting items                   | Save Allowed     |
| **P4** | Crossroads    | High Risk vs Safe Path          | **Load Allowed** |
| **P5** | Treasure      | Random Chance Outcome           | Save Disabled    |
| **P6** | Result        | Classification Result           | -                |

---

## 5. Exhibition Optimization (Kiosk Rules)

1. **Idle Timer:** 60초간 입력 없을 시 메인 화면으로 리셋.
2. **Smooth Movement:** 카메라 급회전 방지 (`damp.epsilon` 또는 `Tween.js` 사용).
3. **Cursor:** 마우스 커서 대신 커스텀 3D 커서 또는 큰 핫스팟 UI 제공.
4. **Local Only:** 모든 데이터는 `LocalStorage`에 저장하여 오프라인 환경 대응.

---

## 6. File Structure (Instruction for Cursor)

```text
/
├── app/
│   ├── page.tsx (Intro)
│   ├── play/page.tsx (Main Game)
│   └── result/page.tsx (Result)
├── components/
│   ├── canvas/ (Three.js Components)
│   └── ui/ (HUD, Buttons, Overlays)
├── lib/
│   ├── store/ (useGameStore.ts)
│   ├── game/ (nodes.ts, classify.ts)
│   └── hooks/ (useSaveLoad.ts)
└── public/
    └── assets/ (pointcloud_files.ply)

```

---
