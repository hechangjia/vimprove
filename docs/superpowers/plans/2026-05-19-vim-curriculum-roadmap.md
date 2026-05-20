# Vim Curriculum Expansion — v2.1.0 → v2.5.0 Roadmap

> **顶层 spec**：5 个独立可发版本的目标、范围、依赖、风险与估算。每个版本接近实施时，由 `superpowers:writing-plans` skill 细化为独立 plan（v2.1.0 已细化，见同目录 `2026-05-19-v2.1.0-foundation-supplement.md`）。

**Goal:** 让 vimprove 从"基础 28 节课"成长为"覆盖快速上手 → 熟练日用 → 深度探索"的完整 Vim/Neovim 学习平台。

**Architecture:** 每个版本 = 一个独立可发的 minor release；引擎能力（`src/core/*`）与课程内容（`src/data/lessons/*`）同步演进；新命令必须有 Neovim 对拍测试。

**Tech Stack:** React 19 + TypeScript + Vite + Vitest + i18next + Tailwind 3 + 现有的 mini Vim 引擎（pure-function reducer）。

---

## 版本概览

| 版本 | 主题 | 引擎工作量 | 内容工作量 | 依赖 | 估算 |
|---|---|---|---|---|---|
| **v2.1.0** | 基础补完 | 中 | 中 | — | 1-2 周 |
| **v2.2.0** | Visual Mode | 大 | 大 | v2.1 | 3-4 周 |
| **v2.3.0** | 生产力之核（Macros + Registers） | 大 | 中 | v2.2 | 3-4 周 |
| **v2.4.0** | Vim 在真实世界（工作流落地） | 0 | 大 | 可并行 | 2-3 周 |
| **v2.5.0** | 学习路径与复习机制 | 小 | 中 | v2.1 | 2-3 周 |

合计 11-16 周（约 3-4 个月）。v2.4.0 是**纯内容版本**，可与任何引擎版本并行开发。

---

## v2.1.0 — Foundation Supplement（基础补完）

**Goal:** 补齐"教 Vim 必须教"的基础导航 + 大写快捷形式 + 大小写操作符，每章末尾加可下载 Cheat Sheet。

### Scope（引擎扩展）
- 新增 motions：`gg` / `G` / `{N}G`、`{` / `}`、`%`
- 新增大写快捷：`D` (= `d$`) / `C` (= `c$`) / `Y` (= `yy`) / `S` (= `cc`)
- 新增 case operators：`~`、`gu{motion}` / `gU{motion}` / `g~{motion}`

### Scope（内容）
- **Chapter 1 末尾追加 3 节**：
  - `motions-file-bounds` — gg / G / {N}G（文件首尾 + 跳行号）
  - `motions-paragraph` — { / }（段落跳转）
  - `motions-bracket-match` — %（括号匹配）
- **Chapter 3 末尾追加 2 节**（位于 `game-2048` 之前）：
  - `operator-shortcuts` — D / C / Y / S
  - `operator-case` — ~ / gu / gU / g~
- **新增 ContentBlock 类型** `cheat-sheet`：渲染当前章节命令汇总 + 下载为 PNG/PDF

### 不做（明确推迟）
- **H / M / L**、**Ctrl-d / Ctrl-u / Ctrl-f / Ctrl-b**：mini editor 无 viewport 概念。延后到 v2.4.0「Vim 在真实世界」配合截图/录屏讲解。

### Dependencies
无。可基于当前 master 直接开始。

### Risks
| 风险 | 缓解 |
|---|---|
| 课程编号变更（章节末尾插入）影响进度记录 | **保留** chapter1-6 编号，新课加在末尾，不破坏 localStorage |
| `%` 多行括号匹配的实现复杂度 | 先做单行括号 (), [], {}；多行跨度作为已知限制写进课程文案 |
| Cheat Sheet PDF 导出体积 | 用 `html-to-image` (~30 KB) 而非 jsPDF (~200 KB)；只导 PNG |
| `gg` 与 `gu`/`gU`/`g~`/`g~` 共用 `g` pending state | 严格状态机：`g` pending 时下一键只能是 `g`/`u`/`U`/`~`/`e`/`E`，其他键清 pending |

### Verification
- 单测：`src/core/motions.test.ts` 增 30+ cases；`src/core/operators.test.ts` 增 case operator cases
- 对拍：`tests/exhaustiveTestCases.ts` 新增 FeatureId `motion_gg_G`、`motion_brace_para`、`motion_percent`、`operator_case`
- 手测：dev server 巡检 5 节新课 + Cheat Sheet 导出
- Bundle：`npm run build` 验证体积增量 < 50 KB

### Deliverable
- 33 节课（28 → 33）
- 5 个新章节级 Cheat Sheet 卡
- 引擎支持命令数 ~40 → ~55
- README CHANGELOG + `src/version.ts` 升 2.1.0

---

## v2.2.0 — Visual Mode（进阶 P0）

**Goal:** 实现 Visual / Visual-Line / Visual-Block 三种 visual 模式，与所有 operator 组合，新增 Chapter 7「视觉选区」全章。

### Scope（引擎扩展）
- 新 mode：`'visual'` / `'visual-line'` / `'visual-block'`
- 新键：`v` / `V` / `Ctrl-v` 进入对应 visual；`Esc` / `v`/`V`/`Ctrl-v`（同键）退出
- visual 状态下所有 motion 扩展选区（`h`/`j`/`k`/`l`/`w`/`b`/`e`/`0`/`$`/`gg`/`G`/`{`/`}`/`%`/text-objects/find）
- visual 状态下应用 operator：`d` / `c` / `y` / `~` / `>` / `<` / `=`
- visual 状态下 `o` 交换选区两端
- visual 状态下 `:` 进入 `'<,'>` ex 命令（v2.2 先 stub，v3.0 实现）

### Scope（内容）
- **新增 Chapter 7「视觉选区」**：~5 节
  - `visual-basics` — v 进入字符 visual，配合 d/y/c
  - `visual-line` — V 行 visual（多行删除/缩进）
  - `visual-block` — Ctrl-v 块 visual（列编辑场景）
  - `visual-textobjects` — visual 内用 text object 扩展选区
  - `visual-mega-review` — 综合关卡

### Dependencies
- v2.1.0 完成（新章节锚点 / `%` 已支持以便 visual + % 跳转括号选区）

### Risks
| 风险 | 缓解 |
|---|---|
| visual-block 实现复杂（不规则行长度） | 用 anchor + cursor 的 `Math.min/max` 表示矩形，行短部分自动跳过 |
| visual 与现有 `pendingTextObject` 状态机冲突 | visual 模式下 `i`/`a` 不再 pending；通过 mode guard |
| Neovim parity：visual 进入后 motion 行为细节 | 先用 `runInNeovim` 跑 50+ 对拍 case 探边界，再实现 |

### Verification
- 新增 `src/core/visual.test.ts` 30+ cases
- `exhaustiveTest.*` 增加 visual FeatureId
- 手测 5 节新课
- VimStatusTab 更新命令矩阵

### Deliverable
- 38 节课（33 → 38）
- 三种 visual 模式 + 所有现有 operator 在 visual 下可用
- 升 2.2.0

---

## v2.3.0 — Productivity Core（生产力之核）

**Goal:** 引入 Macros + 命名 Registers + Marks（位置标记）+ Jumplist，让用户从"熟练"走向"高效"。

### Scope（引擎扩展）
- **Macros**：`q{a-z}` 开始录制 → 再按 `q` 结束 → `@{a-z}` 重放 → `@@` 重复上次 → `{N}@a` 重放 N 次
- **Registers**：`""`（默认 yank/paste）、`"0`（仅 yank）、`"_`（黑洞，用于不污染默认寄存器的删除）、`"a-z`（命名）
  - 系统剪贴板 `"+` / `"*` 通过 `navigator.clipboard` 桥接（异步，UI 层 hook）
- **Marks**：`m{a-z}` 设置标记 → `` `{a-z} `` 跳到精确位置 → `'{a-z}` 跳到行首 → `''` / `` `` `` 跳到上一处
- **Jumplist**：`Ctrl-o` 后退 / `Ctrl-i` 前进；motions 中 `gg`/`G`/`/`/`?`/`{`/`}`/`%` 入栈
- **Changelist**：`g;` / `g,` 在最近修改之间跳转

### Scope（内容）
- **新增 Chapter 8「宏与寄存器」**：~5 节
  - `macros-basics` — 录制 + 回放
  - `macros-count` — `5@q` 批量
  - `registers-named` — `"ay` / `"ap` 多剪贴板
  - `registers-system` — `"+y` 与 OS 剪贴板
  - `macros-mega-challenge` — 用宏处理一段重复任务
- **新增 Chapter 9「跳转历史与标记」**：~3 节
  - `marks-basics` — m/`/'
  - `jumplist` — Ctrl-o / Ctrl-i
  - `changelist` — g; / g,

### Dependencies
- v2.2.0（visual 模式下应能用宏）

### Risks
| 风险 | 缓解 |
|---|---|
| 宏录制的键序列要在不同 VimState 上回放，注意 buffer 变更后的 cursor 安全 | 录制时存原始 KeyPress[]，重放时纯走 reducer，不缓存中间态 |
| 系统剪贴板异步 vs 引擎同步矛盾 | UI 层 hook 拦截 `"+`，预读 clipboard 后再 dispatch；或显示 "loading clipboard…" |
| Jumplist 设计选择（按 motion 还是按 cursor 距离）| 按官方文档：>1 行的 motion 入栈 |

### Verification
- `src/core/macros.test.ts`、`registers.test.ts`、`marks.test.ts`
- 对拍 100+ cases
- 课程手测
- localStorage：宏 + 命名寄存器是否需要持久化？默认**不**持久化（与 Vim 一致），但提供"保存我的宏"高级选项

### Deliverable
- 46 节课（38 → 46）
- 引擎进入"准生产可用"
- 升 2.3.0

---

## v2.4.0 — Vim in the Real World（工作流落地）⭐ ROI 最高

**Goal:** **零引擎工作量**，纯内容章节。让用户学完知道"如何把 vim 用进自己的日常"。

### Scope（仅内容）
- **新增 Chapter 10「Vim 在真实世界」**：~6 节
  - `install-and-minimal-config` — Vim / Neovim 在 macOS/Linux/Windows 的安装 + 30 行 init.lua / vimrc 起步
  - `vim-in-vscode` — VSCode "Vim" 插件配置 + 常用 keymap
  - `vim-in-jetbrains` — IdeaVim + 常见坑（IDE action keymap）
  - `vim-in-terminal` — `set -o vi` (bash/zsh) / git commit / `less` / `man`
  - `editor-shortcut-migration` — VSCode 常用快捷键 → Vim 等价表（Cmd+D / Ctrl+Shift+K / Alt+Up …）
  - `realworld-refactor-demo` — 用 vim 命令组合做一次完整重构演示（GIF + 步骤分解）

- **每节课包含**：
  - Markdown 步骤说明
  - GIF / MP4 嵌入（需要拍摄/录制）
  - 在已有的 mini editor 中提供"练习对应场景"的 challenge（可选）

### Dependencies
**无引擎依赖**——可与任何版本并行开发。

### Risks
| 风险 | 缓解 |
|---|---|
| 截图/GIF 制作工作量大 | 可以用 asciinema + asciicast2gif；或先用静态截图 + 关键步骤标注 |
| 第三方工具（IDE 插件）版本变化导致教程过时 | 文末标"截至 2026-05 测试通过"；每年复检一次 |
| 平台差异（macOS/Linux/Windows） | 每个安装小节用 tabbed 区块分平台 |

### Verification
- 全部为 markdown，无单测可写
- 手测：dev server 巡检 6 节课
- 内容评审：建议外部 Vim 用户读一遍

### Deliverable
- Chapter 10 全 6 节
- 至少 10 个嵌入媒体（GIF / 截图 / 录屏）
- 升 2.4.0

---

## v2.5.0 — Learning Path & Review（学习路径与复习）

**Goal:** 增加"30 分钟生存包"入口、每章 Cheat Sheet（v2.1 已加，此处增强）、遗忘曲线复习、按键热力图、个性化进度。

### Scope（功能）
- **30 分钟生存包**：首页新增按钮，进入精选的 8 节短课（i / Esc / hjkl / dd / x / u / :wq 概念 / 退出）
- **遗忘曲线复习**：每次进入新章节前，按 1d/3d/7d/14d 间隔从已完成课程中抽 1-2 个 challenge 让用户复习；通过则更新 review 进度
- **按键热力图**：在设置页新增 "我的按键统计" tab，用 D3 / 简单 SVG 渲染键盘高频/低频
- **"还能更短" 提示**：完成 challenge 后分析 KeyHistory，若发现冗长操作（如连续 5+ 个 `l`），提示"用 `f.` 或 `5l` 更短"
- **章末 Cheat Sheet 卡升级**：从 v2.1 的静态导出升级为"动态根据用户当前进度只显示已学命令"

### Scope（数据）
- `useReviewSchedule.ts` — 复习调度（localStorage）
- `useKeyStats.ts` — 按键统计累加器
- `useCommandSuggester.ts` — 短路径建议

### Dependencies
- v2.1.0（Cheat Sheet 已建立）
- v2.2.0（visual 命令进入热力图统计）
- 推荐 v2.3.0（让生产力命令进入"还能更短"建议）

### Risks
| 风险 | 缓解 |
|---|---|
| "还能更短" 算法误报率 | 仅给固定 3-5 种确定性建议（连续 hjkl → f/t；连续 `dw` → `dN w`；连续退格 → `c{motion}`），不做模糊判断 |
| 复习中断学习连贯性 | 复习可关；只在新章节入口主动出现，且可"今天不复习" |
| 隐私：按键统计是否上传？ | 默认全本地；可选导出 JSON 自查 |

### Verification
- 单测：`useReviewSchedule.test.ts`、`useKeyStats.test.ts`
- 手测：完成一遍生存包 → 看复习触发 → 看热力图
- 性能：热力图 D3 渲染不影响 60fps

### Deliverable
- 首页生存包入口
- 设置增加"我的按键统计"
- 章末 Cheat Sheet 动态化
- 升 2.5.0

---

## 跨版本通用规范

### 提交规范
- 每个版本独立一个 `release/v2.x.0` 分支（或 master 上的多个 commit + tag）
- 每个 Task 独立 commit；version bump 单独一个 commit
- 引擎扩展必须先有失败测试再实现（TDD）

### i18n 规范
- 每节新课必须同时更新 `en` 默认（在 .ts 中） + `zh` + `zh-lively`
- key-list 的 desc 用 `i18nKey` 走翻译，而不是写死中文

### 文档更新
- 每个版本 release 时：
  - `CLAUDE.md` "已支持的命令" 章节同步
  - `README.md` CHANGELOG 增加 ≤4 条精简记录
  - `src/version.ts` + `package.json` 同步升版

### 已知不在 v2.x 范围（留给 v3.0+）
- Ex 命令（`:s/x/y/g` / `:%s` / `:g/pat/d` / `:wq`）
- Folding（`zo` / `zc` / `za`）
- Buffer / Window / Tab 管理
- Web Component 嵌入
- MCP server
- AI 教练
- 排行榜 / 多人 PK

---

## 顶层优先级建议

如果团队只有时间做 2 个版本：
1. **v2.4.0 + v2.1.0** — 用户体感价值最高
2. **v2.2.0 + v2.4.0** — 引擎竞争力 + 落地价值

如果团队全力推 3 个月：
- **v2.1 → v2.4 → v2.5** 并行 v2.4 内容创作

---

## Self-Review

✅ 每个版本都标注了 goal、scope（含 引擎 / 内容拆分）、依赖、风险、估算、验证方式
✅ v2.x 与 v3.0+ 范围有明确边界
✅ 类型 / 方法签名留在各版本 plan 中细化（roadmap 是 spec 级别，不做 step）
✅ 引擎工作量与课程工作量并行评估，避免单一维度失衡
✅ v2.4 标注可并行，提供调度灵活性
