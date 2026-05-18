[根目录](../../CLAUDE.md) > [src](../) > **hooks**

# hooks — 业务逻辑的 React 封装

## 模块职责

把"有副作用"或"跨组件复用"的逻辑装进 React Hook：

- 包装纯函数 Vim 引擎（`useReducer` 桥接 core/vimReducer）
- 持久化（localStorage：进度、设置、贪吃蛇成绩）
- 计时 / 目标判定（Challenge）
- i18n 包装（含 missing key 兜底）
- 字体按需加载、按键历史聚合等 UI 增强

## 入口与启动

每个 hook 一个文件，**没有 index 聚合**——按需具名 import。

```ts
import { useVimEngine } from '@/hooks/useVimEngine';
import { useChallenge } from '@/hooks/useChallenge';
import { useProgress } from '@/hooks/useProgress';
import { useTranslationSafe, useLocale } from '@/hooks/useI18n';
import { useSettings } from '@/hooks/useSettings';
import { useHjklSnakeStats } from '@/hooks/useHjklSnakeStats';
import { useKeyHistory } from '@/hooks/useKeyHistory';
import { useFontLoader, FONT_CONFIGS, getFontFamily } from '@/hooks/useFontLoader';
```

## 对外接口（逐个 Hook）

### `useVimEngine(initialState?)`
- 返回 `{ state, dispatch }`；内部 `useReducer(vimReducer, { ...INITIAL_VIM_STATE, ...initialState })`
- 课程层只需提供 `buffer` / `cursor`，其它字段交给 INITIAL

### `useChallenge(config, state, onComplete?)`
- 监听 `state` 变化，按 `config.goals[].validator` 标记完成
- 第一次有目标达成时启动计时；累计达成数 ≥ `goalsRequired` → `setIsComplete(true)` 并触发 `onComplete({ time })`
- 提供 `restart()` / `startTimer()`，配合 `config` 引用变化自动重置（切课用）
- 返回：`{ goalsStatus, elapsed, isComplete, restart, startTimer, completedCount }`

### `useProgress()`
- localStorage key: `'vimprove-progress'`
- 形状：`UserProgress = { [slug]: { completedGoalsCount, totalGoals, bestTimeSeconds, attemptsCount, lastCompletedAt } }`
- 返回：`{ progress, updateLessonProgress(slug, partial) }`

### `useI18n.ts` — `useTranslationSafe` + `useLocale`
- `useTranslationSafe(ns?)`：返回 `{ t, i18n }`；`t(key, _defaultValue?, options?)` 在 missing 时回退到 `'TRANSLATION MISSING'`（**注意：传入的 `defaultValue` 实际被忽略**，统一显示 sentinel 以便发现漏翻）
- `useLocale()`：`{ locale, setLocale(code), supported }`；切换语言时写 `localStorage.i18nextLng`

### `useSettings()`
- localStorage key: `'vimprove-settings'`
- 形状：`{ editor: { fontSize: 16, fontFamily: 'Consolas' }, theme: 'system' | 'dark' | 'light' }`
- 返回：`{ settings, updateEditorSettings, updateTheme, resetToDefaults }`
- 通常通过 `@/contexts/SettingsContext` 的 `useSettingsContext()` 消费，避免重复实例

### `useHjklSnakeStats()`
- localStorage key: `'vimprove-minigame-hjkl-snake'`
- 形状：`{ version: 1, attemptsCount, bestRun, bestSurvivalMs, recentRuns: HjklSnakeRun[] }`
- "更好的一局"判定：`score > → timeToScoreMs < → survivalMs >`
- 返回：`{ stats, recordRun(run), resetStats() }`

### `useKeyHistory()`
- 把原始 `KeyPress` 序列聚合为 `KeyGroup`（operator+motion、Insert+text、find+char、count+motion ...）
- 数据契约见 `@/core/keyHistory.types.ts`
- 用于 `KeyHistoryPanel`（编辑器右侧实时显示）

### `useFontLoader()`
- 暴露 `FONT_CONFIGS`（含 Consolas / Fira Code / JetBrains Mono / Cascadia Code 等）
- `getFontFamily(name)`：拼装 CSS font-family 字符串（含 fallback）
- Hook 内部按需 inject Google Fonts `<link>`

## 关键依赖

- React 19 (`useReducer` / `useState` / `useEffect` / `useRef` / `useCallback`)
- `react-i18next`、`i18next` 仅在 `useI18n.ts`
- 只通过 `@/core/types` 引用引擎类型，**不直接 import core 内部实现**（除了 `useVimEngine` 引用 `vimReducer` + `INITIAL_VIM_STATE`）

## 持久化 Key 总览

| Key | Hook | 用途 |
| --- | --- | --- |
| `vimprove-progress` | `useProgress` | 课程进度 |
| `vimprove-settings` | `useSettings` | 字体/字号/主题 |
| `vimprove-minigame-hjkl-snake` | `useHjklSnakeStats` | 贪吃蛇成绩 |
| `vimprove_current_lesson` | `App.tsx`（非 hook） | 上次学到的 slug |
| `i18nextLng` | `useLocale` | 当前语言 |

## 测试与质量

本目录暂无单测；hooks 的行为通过端到端的 component 渲染与 core 引擎单测间接覆盖。新增 hook 建议补 `*.test.ts(x)`（推荐 vitest + @testing-library/react）。

## 常见问题 (FAQ)

- **`useTranslationSafe` 的 `defaultValue` 怎么不生效？** 设计如此：所有 missing 都显示 `'TRANSLATION MISSING'` sentinel，强制补翻；如要走业务回退，请改用原生 `useTranslation`。
- **切课后 Challenge 状态不重置？** `useChallenge` 通过 `config !== prevConfigRef.current` 重置；确保父组件传入的是**新的** `config` 引用（而不是原地 mutate）。
- **HjklSnake 高分排序奇怪？** 阅读 `isBetterRun`：score > timeToScoreMs < survivalMs >，三级比较。

## 相关文件清单

```
src/hooks/
├── useVimEngine.ts        # 引擎桥接 (useReducer)
├── useChallenge.ts        # 目标验证 + 计时
├── useProgress.ts         # 学习进度持久化
├── useI18n.ts             # i18n + locale 切换
├── useSettings.ts         # 编辑器/主题设置
├── useHjklSnakeStats.ts   # 贪吃蛇成绩
├── useKeyHistory.ts       # 按键历史聚合
└── useFontLoader.ts       # Google Fonts 按需加载
```

## 变更记录 (Changelog)

- 2026-05-18 初始化模块级 CLAUDE.md（init-architect 自动生成）
