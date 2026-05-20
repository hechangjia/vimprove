[根目录](../../CLAUDE.md) > [src](../) > **components**

# components — UI 组件

## 模块职责

承接所有 React 渲染：消费 hooks 层的状态、`@/core/types` 的类型、`@/data` 的课程数据，产出可交互界面。组件按职责分目录，**每个目录都是一个"功能域"**。

## 目录结构

```
src/components/
├── common/         # 跨页通用块
├── lesson/         # 课程页主视图
├── challenge/      # 挑战编辑器（内置 Vim）
├── example/        # 可播放示例（Run Example）
├── minigame/       # 小游戏（HJKL Snake）
├── layout/         # Sidebar / MobileHeader
└── settings/       # 设置面板（多 Tab）
```

## 子目录详解

### `common/`
- `MarkdownBlock.tsx` — `react-markdown + remark-gfm`，预先映射 h2/h3/p/ul 等到 Tailwind 类
- `KeyListBlock.tsx` — 渲染 `KeyItem[]`（command + 描述），支持 i18n base key
- `KeyHistoryPanel.tsx` — 滚动容器 + 自动跟随，渲染 `KeyHistory`
- `KeyGroupBlock.tsx` — 单个聚合按键组（operator+motion / count+motion / find+char ...）的视觉块

### `lesson/`
- `LessonView.tsx` — **页面主体**。遍历 `lesson.contentBlocks`，按 `block.type` 分发到 Markdown / KeyList / VimChallenge / RunExamplePlayer / HjklSnakeGame
  - i18n 索引契约：`lessons.{slug}.title` / `shortDescription` / `content.{idx}`
  - 只有 `locale !== 'en'` 时才走翻译查找，否则直接用 .ts 原值

### `challenge/`
- `VimChallenge.tsx` — 自带迷你 Vim 编辑器；内部 `useVimEngine` + `useChallenge` + `useKeyHistory`，通过隐藏 `<input>` 捕获键盘并 `preventDefault`
  - 完成时调用 `onComplete({ time })`；支持 `restart`、计时 HUD、目标勾选
  - 渲染时使用 `tokenizeLine` + `getLigatureRange`

### `example/`
- `RunExamplePlayer.tsx` — 步进式/自动播放 `RunExampleConfig`
  - 内部独立维护 `VimState`（通过 `vimReducer` 派发 `RunExampleStep.key`）
  - 关键陷阱：`executeStepImmediately` 必须在使用前声明（TDZ）

### `minigame/`
- `HjklSnakeGame.tsx` — h/j/k/l 方向的贪吃蛇；本地金/银/铜徽章，按 `r` 重开，撞墙宽限
  - 通过 `useHjklSnakeStats` 落地最佳记录

### `layout/`
- `Sidebar.tsx` — 课程列表（按 CATEGORIES 分组折叠）、底部首页+语言切换、版本/分支显示
  - 桌面端常驻、移动端通过 `isOpen` 控制
- `MobileHeader.tsx` — 移动端顶栏：菜单 / 上一课 / 下一课 / 语言 / 设置 / GitHub，滚动隐藏

### `settings/`
- `SettingsPanel.tsx` — 顶部 Tab 切换 → 外观 / Vim 状态 / Playground / 按键统计
- `AppearanceTab.tsx` — 字体（按需加载）/ 字号 / 主题（system / dark / light），实时预览
- `VimStatusTab.tsx` — 引擎状态可视化（Neovim 对拍结果展示）
- `VimPlaygroundTab.tsx` — 语法高亮的自由练习场（C++ / JS / Python）
- `KeyStatsTab.tsx` — 本地按键统计面板
- `EditorStyleApplier.tsx` — 把 `useSettings` 的字体/字号写到 CSS 变量，供编辑器使用

## 关键依赖

- `react`、`react-i18next`、`react-markdown` + `remark-gfm`、`rehype-highlight`、`lucide-react`
- `@/core/*` 类型 + `vimReducer` + `syntaxHighlight` + `ligatures` + `keyHistory.types`
- `@/hooks/*` 全套
- `@/data` 的 `LESSONS` / `CATEGORIES`（仅 Sidebar）
- `@/contexts/SettingsContext`（Settings 系列）

## 关键约束

1. **键盘输入只通过隐藏 `<input>` 捕获**——不要用 `contenteditable`。所有命令通过 `keydown` + `preventDefault`。
2. **失焦保护**：用户点击页面其它区域时编辑器会失焦，VimChallenge 需要显示"点击恢复"。
3. **任何文案必须走 i18n**：用 `useTranslationSafe` 而不是 `useTranslation`，以便 missing key 一眼识别。
4. **不要在组件里手写 Vim 逻辑**——所有按键效果都派发给 reducer，UI 只读 `state`。
5. **样式优先使用语义色**：`bg-background` / `text-foreground` / `border-stronger` 等（见 `tailwind.config.js`），避免直接用 `stone-*` / `green-*`。
6. **课程切换**：父组件给 `VimChallenge` / `RunExamplePlayer` 传新的 `config` 引用，触发 `useChallenge` 内部重置。

## 主要数据流

```
keydown
   │
   ▼
VimChallenge (隐藏 input)
   │  dispatch({ type: 'KEYDOWN', payload: { key, ctrlKey } })
   ▼
useVimEngine → vimReducer (core)
   │
   ▼
new VimState
   ├──→ 渲染 buffer + cursor + ligature + token 高亮
   ├──→ useChallenge → validator → goalsStatus / isComplete
   └──→ useKeyHistory → KeyHistoryPanel
```

## 测试与质量

无组件单测。质量靠：
- TypeScript strict
- ESLint（含 react-hooks 规则）
- 引擎层单测保证状态正确性
- 人工巡检 + Neovim 对拍兜底

## 相关文件清单（精选）

```
src/components/
├── common/{MarkdownBlock,KeyListBlock,KeyHistoryPanel,KeyGroupBlock}.tsx
├── lesson/LessonView.tsx
├── challenge/VimChallenge.tsx
├── example/RunExamplePlayer.tsx
├── minigame/HjklSnakeGame.tsx
├── layout/{Sidebar,MobileHeader}.tsx
└── settings/
    ├── SettingsPanel.tsx
    ├── AppearanceTab.tsx
    ├── VimStatusTab.tsx
    ├── VimPlaygroundTab.tsx
    └── EditorStyleApplier.tsx
```

## 变更记录 (Changelog)

- 2026-05-18 初始化模块级 CLAUDE.md（init-architect 自动生成）
