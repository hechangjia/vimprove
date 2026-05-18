[根目录](../../CLAUDE.md) > [src](../) > **core**

# core — Vim 引擎核心

## 模块职责

实现一个**纯函数、零运行时依赖**的 Vim 命令解析与状态管理引擎。所有状态变换通过 reducer 完成，可单测、可对拍 Neovim、可被 React Hook 安全包装。

- 解析按键 → 派发命令 → 产生新 `VimState`（不可变）
- 提供 motion / operator / text-object / search / find / dot-repeat / undo-redo 全套语义
- 通过 `runSim` + `runInNeovim` 实现自动化对拍（headless Neovim）

## 入口与启动

| 文件 | 角色 |
| --- | --- |
| `vimReducer.ts` | 主 reducer：`vimReducer(state, action) → VimState`，外加 `INITIAL_VIM_STATE` |
| `types.ts` | 全部公开类型（`VimState` / `Command` / `Lesson` / `ChallengeGoal` / `ContentBlock` / `RunExampleConfig` / `KeyPress` / `Motion` / `TextObject` 等） |

`VimState` 关键字段：`buffer`、`cursor`、`mode`、`pendingOperator`、`pendingReplace`、`pendingFind`、`pendingTextObject`、`pendingSearch`、`lastSearch`、`lastCommand`、`history` + `historyIndex`、`register`、`insertCol` / `insertStart`、`count`、`lastFind`、`lastChange*`、`changeRecording*`、`recording*`。

## 对外接口

| 文件 | 关键导出 |
| --- | --- |
| `motions.ts` | `getMotionTarget(state, motion, count)`，`findCharOnLine(line, fromCol, char, kind)`；内部含 word/WORD/line-bounds/find 全部位移逻辑 |
| `operators.ts` | `applyOperatorWithMotion`、`applyOperatorWithFindMotion`、`applyOperatorWithTextObjectCount`、`buildRegisterText`、`deleteRange`、`isTextObjectMotion` |
| `stateUtils.ts` | `createSnapshot`、`pushHistory`、`getCount`、`startRecording` / `finishRecording`、`recordKey`、`clearPendingStates` |
| `utils.ts` | `clampCursor(cursor, buffer)`、`isWhitespace`、`isWordChar`、`isPunctuation` |
| `ligatures.ts` | `getLigatureRange(line, cursorCol)`：检测光标是否命中常见编程连字（用于禁用渲染） |
| `syntaxHighlight.ts` | `tokenizeLine`、`getTokenClassName`：编辑器渲染的轻量 token 化 |
| `keyHistory.types.ts` | `KeyHistory` / `KeyGroup` / `KeyAtom` / `KeyKind` / `PendingKind`：按键历史面板的数据契约 |

## 关键依赖与配置

- **零运行时依赖**：仅 TypeScript 类型，被 `src/hooks/useVimEngine.ts` 通过 `useReducer` 包装。
- 与 React 的边界：core 不引入 React；任何"副作用"（计时、localStorage、focus）都放在 hooks/components 层。

## 数据模型与状态机要点

1. `ESC` 在任意 pending 状态下必须清空 `pendingOperator` / `pendingReplace` / `pendingFind` / `pendingTextObject` / `pendingSearch` / `count`。
2. `cursor` 必须始终通过 `clampCursor` 保持合法。
3. Insert 模式下使用 `insertCol`（0..len）作为真实插入点，`cursor.col` 仅作显示；退出 insert 时由 reducer 修正。
4. `dot`（`.`）重放使用 `lastChange` + `lastChangeCount` + `lastChangeCursor` + `lastChangeInsertCursor` + `lastChangeInsertStart`；新 count 会覆盖记录中的 count。
5. `history` 是状态快照数组，`historyIndex` 指向当前位置；undo 减索引，redo 加索引；`createSnapshot` 会同时拷贝 `lastChange` / `insertStart`。
6. 行级 count 越界（`dd` / `yy`）→ no-op，不写历史。
7. 多行寄存器粘贴：非行 wise 时拆行插入，首行落点与 `p` / `P` 一致。

## 已实现命令清单

完整能力列表见根 `CLAUDE.md` 的「Vim Engine Capabilities」章节。新增命令的推荐流程：
1. 在 `motions.ts` 或 `operators.ts` 添加纯函数；
2. 在 `vimReducer.ts` 的 `KEYDOWN` 分支接键并维护 pending 状态；
3. 必要时在 `types.ts` 扩展 `Motion` / `TextObject` / `Command` 联合类型；
4. 补 `*.test.ts` 单测；
5. 使用 `utils/vimprove-debug.cjs` 与 Neovim 对拍验证。

## 测试与质量

### 单元测试
- `motions.test.ts` — 基础/单词/行内/查找移动
- `operators.test.ts` — d/c/y + motion、文本对象
- `vimReducer.test.ts` — 模式切换、编辑、undo/redo
- `dot-command.test.ts` — `.` 重放（包含 cw / paste / count 覆盖等边界）

### 对拍测试
- `vimParity.test.ts` — 与 Neovim 的精挑用例对拍
- `vimParityExhaustive.test.ts` — 详尽组合对拍（汇总）
- `tests/exhaustiveTest.{0..7}.test.ts` — 8 分片并行，分片通过 `getShardCases(idx, 8)` 按 hash 取模
- `testUtils/runSim.ts` — 按 vim 风格的 `<Esc>` / `<CR>` / `<C-r>` 等 token 解析键序列
- `testUtils/runInNeovim.ts` — `spawnSync` headless Neovim；不可用时通过 `NeovimNotAvailableError` 跳过
- `tests/exhaustiveTestCases.ts` — 按 `FeatureId` 组织用例池（`motion_*` / `operator_*` / `text_objects` / `paste` / `search` ...）

### 调试工作流（来自根 CLAUDE.md）
1. `bash utils/vitest-quickcheck.sh` 快速抽样定位用例
2. `node utils/nvim-state-probe.cjs --keys 'p' --lines '[...]' --cursor 1,5` 取 Neovim 真实游标/模式
3. `node -r sucrase/register utils/vimprove-debug.cjs <label> <shard> [--trace]` 对照模拟器 vs Neovim

## 常见问题 (FAQ)

- **Q: 为什么 `cursor.col` 在 insert 模式下"不对"？** A: 因为 insert 模式用 `insertCol` 做真实插入位置，渲染时也参考它；这是为了让 `c$` / `cw` / `Escape` 的列位置和 Neovim 一致。
- **Q: 添加新命令为什么 `.` 重放对不上？** A: 检查 `changeRecording` / `recordingCount` 是否在命令执行路径上正确 `startRecording` → `finishRecording`，并确保 `lastChange*` 字段一同更新。
- **Q: 撤销少一步 / 多一步？** A: `createSnapshot` 中"同 buffer + 同 mode"会被 `isSameSnapshot` 去重；如果你的命令真的改了 buffer，请检查是否在 push 之前修改了 buffer 引用。

## 相关文件清单

```
src/core/
├── types.ts                    # 全部公开类型
├── vimReducer.ts               # 主 reducer（KEYDOWN / RESET）
├── motions.ts                  # h/j/k/l/w/b/e/0/$/^/_/W/B/E/find
├── operators.ts                # d/c/y + motion / text-object 范围
├── stateUtils.ts               # snapshot/history/recording/count
├── utils.ts                    # clampCursor/isWhitespace/isWordChar/isPunctuation
├── ligatures.ts                # 连字检测
├── syntaxHighlight.ts          # 轻量 token 化
├── keyHistory.types.ts         # 按键历史面板数据契约
├── motions.test.ts
├── operators.test.ts
├── vimReducer.test.ts
├── dot-command.test.ts
├── vimParity.test.ts
├── vimParityExhaustive.test.ts
├── testUtils/
│   ├── runSim.ts
│   └── runInNeovim.ts
└── tests/
    ├── exhaustiveTestCases.ts
    └── exhaustiveTest.{0..7}.test.ts
```

## 变更记录 (Changelog)

- 2026-05-18 初始化模块级 CLAUDE.md（init-architect 自动生成）
