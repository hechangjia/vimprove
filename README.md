# Vimprove

一个交互式 Vim 学习网站，通过浏览器中的"迷你 Vim 编辑器 + 关卡式练习"帮助用户掌握 Vim 命令。

## ✨ 功能特性

- **纯函数 Vim 引擎** - 零依赖的 Vim 命令解析器，所有状态更新通过 reducer 管理
- **关卡式学习** - 循序渐进的课程设计，从基础移动到高级编辑
- **实时反馈** - 即时验证目标完成情况，可视化编辑器状态
- **可播放示例** - Run Example 功能展示命令执行过程
- **进度追踪** - 本地存储学习进度，记录完成时间和尝试次数

## 🎯 Vim编辑器功能实现

<img src="./assets/functions.png" width="50%">

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 运行测试
npm test

# 测试 UI 界面
npm run test:ui

# 生成测试覆盖率
npm run test:coverage

# 运行对拍测试 - 基本功能
npm run test -- src/core/vimParity.test.ts

# 运行对拍测试 - 详尽测试
npm run test -- src/core/vimParityExhaustive.test.ts
```

访问 `http://localhost:3000` 开始学习。

## 🛠️ 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS 3** - 样式方案
- **React Router** - 路由管理
- **React Markdown** - Markdown 渲染

## 📁 项目结构

```
src/
├── core/              # Vim 引擎核心（纯逻辑，零依赖）
│   ├── types.ts      # 类型定义
│   ├── vimReducer.ts # 状态管理 reducer
│   ├── motions.ts    # 移动逻辑
│   ├── operators.ts  # 操作符逻辑
│   └── utils.ts      # 工具函数
│
├── data/              # 课程数据
│   ├── categories.ts # 课程分类
│   └── lessons/      # 课程文件（按章节组织）
│       ├── chapter1/ # 模式与基础移动（8 课）
│       ├── chapter2/ # 单词移动与小编辑（5 课）
│       ├── chapter3/ # 高级编辑（8 课）
│       ├── chapter4/ # 行内查找与精确编辑（4 课）
│       ├── chapter5/ # 文本对象（5 课）
│       ├── chapter6/ # 搜索与重构（4 课）
│       ├── chapter7/ # Visual Mode（5 课）
│       ├── chapter8/ # 宏与寄存器（5 课）
│       ├── chapter9/ # 标记与跳转历史（3 课）
│       ├── chapter10/ # 真实世界 Vim 工作流（6 课）
│       ├── chapter11/ # 日常 Vim 熟练度（4 课）
│       ├── chapter12/ # 项目导航（4 课）
│       ├── chapter13/ # 屏幕导航（4 课）
│       └── chapter14/ # 项目工作区（4 课）
│
├── hooks/             # 自定义 hooks
│   ├── useVimEngine.ts    # Vim 引擎封装
│   ├── useChallenge.ts    # 挑战逻辑
│   └── useProgress.ts     # 进度持久化
│
├── components/        # UI 组件
│   ├── common/       # 通用组件
│   ├── lesson/       # 课程组件
│   ├── challenge/    # 挑战组件
│   ├── example/      # 示例播放器
│   └── layout/       # 布局组件
│
└── pages/            # 页面组件
```

## 🧪 测试

- 测试框架：Vitest（`npm run test -- <file>` 可按文件执行）
- 覆盖范围：
  - `src/core/motions.test.ts` - 基础/单词/行内/查找移动
  - `src/core/operators.test.ts` - d/c/y + motion、文本对象
  - `src/core/vimReducer.test.ts` - 模式切换、编辑、undo/redo
  - `src/core/dot-command.test.ts` - `.` 重放
  - `src/core/vimParity.test.ts` - 与 Neovim 对拍测试
  - `vimParityExhaustive.test.ts` - 与 Neovim 对拍测试（详尽）

## 🕊️ Roadmap 状态

### v2.0.0
- [x] hjkl贪吃蛇
- [x] alpha分支选择
- [x] 亮色模式

### 质量收口
- [x] 优化默认编辑器字体，优先使用 JetBrains Mono 降低 `i` / `l` 混淆
- [x] 统一 Normal / Visual 模式下的块状光标渲染，包括行尾位置
- [x] 增加课程注册表审计测试，覆盖 slug、分类、顺序、课程数量与内容块形状
- [x] 文案结构由 i18n 完整性与结构测试持续校验

### 已知限制
- Visual Block 已支持基础选择与 `y` / `d` / `c`，但完整 blockwise paste 与块插入回放语义仍是后续增强项
- `"+` / `"*` 系统剪贴板寄存器需要浏览器 Clipboard API 桥接，当前仍按本地模拟寄存器处理

### v2.2.0
- [x] Visual Mode 基础：支持 `v` / `V` / `Ctrl-v` 三种选择模式、选区移动、高亮与 `y` / `d` / `c`
- [x] Chapter 7：新增 5 节 Visual Mode 课程，并同步 zh / zh-lively 翻译
- [x] 修复 `exhaustiveTestCases.ts` 的 `count` union typecheck 错误
- [x] 保持 Chapter 10 v2.4 内容为隐藏草稿，避免在 Chapter 7-9 前提前出现在课程导航

### v2.3.0
- [x] Macros：支持 `q{a-z}` 录制、`@{a-z}` / `@@` 回放、counted macro replay
- [x] Registers：支持命名寄存器、`"0` 最近 yank、`"_` 黑洞删除
- [x] Marks / Jumplist / Changelist：支持 `m{a-z}`、`` `{mark}``、`'{mark}`、`Ctrl-o` / `Ctrl-i`、`g;` / `g,`
- [x] Chapter 8-9：新增 8 节生产力课程，并同步 zh / zh-lively 翻译

### v2.4.0
- [x] 发布 Chapter 10：6 节真实世界 Vim 工作流课程
- [x] 覆盖安装与最小配置、VSCode Vim、IdeaVim、终端 vi mode、快捷键迁移、真实重构演示
- [x] 同步 zh / zh-lively 翻译，并保持零引擎改动

### v2.5.0
- [x] 首页新增 30 分钟生存包入口
- [x] 设置页新增本地按键统计面板
- [x] Challenge 完成后提供确定性的“还能更短”提示

### v2.6.0
- [x] 新增 Command-line mode 基础：`:`、`Escape`、`Enter`
- [x] 新增模拟文件命令与 substitute：`:w` / `:q` / `:wq` / `:q!` / `:s` / `:%s`
- [x] 新增 Chapter 11：4 节日常 Vim 工作流课程
- [x] 新增 Find Target 小游戏，训练 `f/F/t/T/;/,` 行内精准定位

### v2.7.0
- [x] 新增模拟 buffer 导航：`:ls` / `:buffers` / `:bnext` / `:bprevious` / `:buffer N`
- [x] 新增模拟 window split：`:split` / `:vsplit` / `:close` / `Ctrl-w h/j/k/l`
- [x] 新增 Chapter 12：4 节项目导航课程
- [x] 新增 Window Navigator 小游戏，训练 `Ctrl-w` 窗口焦点移动

### v2.8.0
- [x] 修正 Settings 中过时的 Vim 支持矩阵
- [x] 首页新增 30 分钟、7 天日常、项目导航三条学习路线入口
- [x] Ex substitute 新增数字范围与 `:g/pattern/s/old/new/g` 窄实现
- [x] 新增 Operator Gym 小游戏，训练 operator + text object 选择

### v2.9.0
- [x] 新增屏幕导航命令：`Ctrl-d/u/f/b`、`zz/zt/zb`、`H/M/L`
- [x] 新增 Chapter 13：4 节屏幕导航课程
- [x] 新增 Scroll Surfer 小游戏，训练半页/整页滚动与视口定位
- [x] 引擎新增 deterministic viewport state，供课程 challenge 校验

### v3.0.0
- [x] 新增 quickfix 项目工作流：`:vimgrep` / `:cnext` / `:cprev` / `:copen` / `:cclose`
- [x] Challenge 编辑器显示当前 buffer 名和 quickfix 面板
- [x] 新增 Chapter 14：4 节项目工作区课程
- [x] 从单 buffer 命令练习升级到多文件项目任务基础


## 📝 CHANGELOG

### v3.0.0
- 新增 Project Workspace foundation：多 buffer 搜索、quickfix 列表、结果跳转与面板显示
- 新增 `:vimgrep /pattern/`、`:cnext`、`:cprev`、`:copen`、`:cclose` 的浏览器内模拟实现
- 新增 Chapter 14「Project Workspace」4 节课程，课程总数达到 69 节
- Challenge UI 显示当前文件名和 quickfix 结果，标志 v3 从命令教学迈向项目级任务训练

### v2.9.0
- 新增屏幕级导航：半页/整页滚动、视口定位、可见屏幕行跳转
- 新增 Chapter 13「Screen Navigation」4 节课程，课程总数达到 65 节
- 新增 Scroll Surfer 小游戏，覆盖 `Ctrl-d/u/f/b` 与 `zz/zt/zb` 训练
- 引擎新增 `viewportTop` / `viewportHeight` / `pendingZ` 状态，方便 challenge 精准校验

### v2.8.0
- 修正 Vim Status 支持矩阵，准确展示 Visual、宏、寄存器、marks、Ex 与项目导航能力
- 首页新增学习路线入口，帮助用户从 61 节课程中选择合适起点
- 新增 `:1,3s/old/new/g` 与 `:g/pattern/s/old/new/g`，增强日常批量编辑训练
- 新增 Operator Gym 小游戏，覆盖 `di"` / `ciw` / `di(` 等语义编辑训练

### v2.7.0
- 新增项目导航引擎层，支持模拟 buffers、windows、buffer 切换与 split 状态
- 新增 `Ctrl-w h/j/k/l` 与 `:wincmd h/j/k/l`，训练键盘窗口焦点移动
- 新增 Chapter 12「Project Navigation」4 节课程，课程总数达到 61 节
- 新增 Window Navigator 小游戏，覆盖 `Ctrl-w` 窗口导航训练

### v2.6.0
- 新增 Command-line mode 基础能力，支持 `:` 提示符、取消、执行与状态显示
- 新增 substitute 工作流：`:s/old/new/`、`:s/old/new/g`、`:%s/old/new/g`
- 新增 Chapter 11「Daily Vim Mastery」4 节课程，课程总数达到 57 节
- 新增 Find Target 小游戏，覆盖 `f/F/t/T/;/,` 行内精准定位训练

### v2.5.0
- 新增 30 分钟生存包入口，帮助新用户直接进入最小可用学习路径
- 新增本地按键统计面板，统计挑战练习中的按键频次
- 新增完成后短路径提示，对连续重复 `h/j/k/l` 给出 count / target jump 建议
- 维持全本地数据策略，无服务端或隐私敏感数据上传

### v2.4.0
- 发布 Chapter 10「Vim in the Real World」6 节课程
- 新增编辑器/IDE/终端落地内容：VSCode Vim、IdeaVim、shell vi mode、快捷键迁移
- 新增真实重构演示课程，课程总数达到 53 节可见课程
- 本版本为纯内容发布，无 Vim 引擎改动

### v2.3.0
- 新增宏与寄存器核心能力：录制/回放/count replay、命名寄存器、最近 yank 寄存器与黑洞寄存器
- 新增 marks、jumplist、changelist 基础跳转能力
- 新增 Chapter 8-9 共 8 节课程，课程总数达到 47 节可见课程
- Chapter 10 v2.4 真实世界课程仍作为隐藏草稿，等待发布窗口再展示

### v2.2.0
- 新增 Visual Mode 基础能力：字符、行、块选择模式，选区高亮，以及 visual `y` / `d` / `c`
- 新增 Chapter 7 Visual Mode 课程 5 节，课程总数达到 39 节可见课程
- 修复 `exhaustiveTestCases.ts` 中 `count` 字段的 TypeScript union 收窄错误
- 保留 Chapter 10 v2.4 真实世界课程为隐藏草稿，等待 Chapter 8-9 衔接后再展示

### v2.1.3
- 修正 `dot-command.test.ts` 中 `c$` + dot 重放的测试期望（原期望违背 Neovim 真实行为，已用 nvim-state-probe 校验后改为 `'test linEND'`）
- 引入 `SKIP_LABELS` 机制，跳过 1 条 multi-line charwise paste 边界用例（`yi{3wP`：Neovim 对跨行 `yi{` 隐式 linewise 处理，独立 bug 已记录）
- 全量测试：1564/1564 通过；全量 parity：1209/1209 有效用例通过

### v2.1.2
- 修复 `e` / `E` 与 operator 组合时的 word-end 边界（`de` / `ce` 在单字符标点上现在正确推进到下一个 word-end）
- 清理 5 条长期存在的 Neovim parity baseline 失败（`ceX<Esc>` / `de` / `dep` / `deP.` / `ceX<Esc>E`）
- 全量 parity：1209/1210 通过（剩 `yi{3wP` 多行粘贴边界，独立 bug 已记录）

### v2.1.1
- 修复 `gu` / `gU` / `g~` 跨行 motion（如 `g~w` 越过段落首行时不应把下一行首字符也大小写）
- 修复 `guu` / `gUU` / `g~~` 线性操作后光标停留位置（对齐 Neovim：first non-blank）
- 接入 `~` / `gu` / `gU` / `g~` 的 `lastChange` 录制，`.` 可正确重放大小写操作
- Neovim parity：启用 `operator_case` + `edit_DCYS` 用例，新增 17 条 case-op 对拍通过

### v2.1.0
- 新增基础导航：`gg` / `G` / `{N}G` / `{` / `}` / `%`（单行匹配）
- 新增大写快捷与大小写操作符：`D` / `C` / `Y` / `S` / `~` / `gu` / `gU` / `g~`（含 linewise `guu`/`gUU`/`g~~`）
- Chapter 1 + 3 新增 5 节课程；每章末尾追加可下载 PNG Cheat Sheet
- 33 节课程 / 全套引擎单测 + 对拍脚手架（部分新特性 v2.2 启用 parity 校验）

### v2.0.1
- 修复 Chapter 4-6 Run Example 动画 bug：自动播放计时器重建、闭包旧 state、播放重启时序
- 修复中文翻译错误：find-char 全角分号/逗号、zh-lively `di()`/`ci()` 冗余括号、错别字、search-basic wrap 描述
- 收紧课程 validator：用 `\b` 词边界 + 出现次数计数，避免删空也算过
- 工程改进：LessonView markdown 类型守卫防白屏、useChallenge effect 拆 ref 防误判、多 track 颜色轮转

### Unreleased

### Release v2.0.0
- 🎨 新增主题切换：亮 / 暗 / 跟随系统（Settings → Appearance），并重构配色系统为 CSS design tokens + Tailwind 语义色映射
- 🎮 新增 Chapter 1 末尾小游戏：HJKL 贪吃蛇（本地成绩、金银铜徽章与提示、按 r 重开、撞墙宽限）
- 🧪 对拍与测试工具链完善：quickcheck、JSON 报告 + viewer（聚合/过滤/排序），对拍并行化与长序列对拍覆盖
- ⚙️ Vim 引擎与课程维护：dot/count/o/O/replace/paste 等对齐 Neovim；修复课程文件大小写冲突并补齐 zh/zh-lively 翻译

### Release v1.5.0
- 🧪 Vim 引擎对拍：`.` 重播（cw/paste/末行 jw）、多行寄存器行粘贴、撤销快照去重与 cw 边界全面对齐 Neovim
- ⌨️ 可视化提升：按键历史面板 + Vim Status 面板，组合键聚合、实时记录与 dot 重播提示一致
- 🌏 输入与体验：Insert 模式中文输入可用，Tooltip 抖动修复，课程切换重新挂载消除键位提示重复
- 🎯 学习流优化：挑战目标与示例文案更清晰（助记/拼写练习），Run Example/课程示例节奏更平滑

### Release v1.0.0
- 🎉 首个正式版本，实现主要功能
- ✨ 新增设置面板「Vim 状态」和「练习场」标签页（支持 C++/JS/Python 语法高亮，展示 Neovim 对拍测试结果）
- 🐛 修复 Insert 模式光标位置和挑战切换状态重置等核心 bug
- 💾 改进学习体验：记住上次学习位置，支持 Enter 快速进入下一课

<details>
<summary><b>点击展开Alpha版本历史</b></summary>

### v1.9.0
- 🧪 增加长序列对拍测试
- 🧩 修复课程文件大小写冲突（motions-WORDs 更名为 motions-words-big），避免大小写不敏感平台编译报错
- 📝 补齐 small-edits-chars 示例及 zh/zh-lively 翻译，并补上行边界课程的中文示例，确保三语言示例一致

### v1.8.0
- 🐛 继续增强对拍测试覆盖率&修复bug
- 🚀 将对拍测试并行化
- 🌍 优化各地访问速度

### v1.7.0
- ⚙️ Vim 引擎：dot 重放 count 覆盖、o/O 多行插入锚点、replace count 连续替换，dd/yy 越界 no-op, text-object 边界修正
- 📌 粘贴修复：多行寄存器行内粘贴拆分插入，光标与 Neovim 对齐
- 🧪 Parity 回归：`oM<Esc>2.`, `2dw[p/P]`, `rau2.`, `ddu2.` 等对拍修复
- 🛠 调试文档：CLAUDE.md 精炼调试流程与引擎行为提示

### v1.6.0
- 🧪 对拍工具链：`vimParity` 报告查看器支持聚合/过滤/排序，新增 quickcheck 脚本快速验证
- 🔧 测试工作流优化：可选模块 quickcheck、JSON 报告 + viewer 调试流程，优化上下文占用

### v1.5.1
- 🐛 Fix replace-wait state: `ru` writes literal `u` instead of triggering undo, matching Vim behavior
- 🧭 Word motion细化：`w` 从标点起跳会先停在 `/` 等分隔符，不再直接跳到下一个单词
- ✅ Parity 覆盖：vimParity 补充上述场景用例，保持 Neovim 行为一致

### v1.4.3
- 🐛 `.` 重播对齐 Vim：cw 光标、末行 jw 落点、paste 重播行为与对拍一致
- 📋 粘贴寄存器修正：多行寄存器按行插入，`P` 粘贴前光标与 Neovim 一致
- 🧭 课程切换重新挂载 lesson 视图，消除键位提示重复字符
- ♻️ 撤销快照去重、插入退出立即落盘，undo/redo 与 Neovim 行为保持一致

### v1.4.2
- 🌏 支持中文输入：Insert 模式正常输入中文，Normal 模式不响应但在按键历史中显示
- 🐛 修复 undo/redo 命令按键历史闪烁问题（清除所有 pending 状态）
- 🎨 修复 Tooltip 位置闪烁：固定向上显示，避免自动方向切换

### v1.4.1
- 🎨 自定义Tooltip组件：按键历史使用本站风格UI，组合键聚合显示所有子成员信息
- 🔁 `.`命令增强：tooltip中显示被重放的具体动作序列（如 `→ cw`）
- 🐛 修复count+motion组合键记录：`3w`等命令正确归为一组而非分开显示

### v1.4.0
- ⌨️ 新增按键历史面板：动画示例和挑战编辑器右侧实时显示所有按键记录
- 🎯 智能组合键分组：operator+motion、Insert+text、find+char 等自动归组，显示等待状态
- ⚡ 按键记录零延迟：同步计算状态并记录，消除 React 渲染周期延迟
- 🔄 改进播放控制：上一步功能正确重建按键历史，重置按钮移至右上角

### v1.2.0
- 📝 课程体验优化：明确挑战目标描述（1.2 课 TARGET 首字母）、添加命令英文助记（w/b/e/s/r）、改进拼写练习示例（更明显的 cXrrent/vXlue）
- 🎬 动画示例改进：2.3 课 w vs W 对比从双光标赛跑改为单光标渐进演示，学习曲线更平缓

### v1.1.0
- ✅ Undo/Redo 与快照对齐 Neovim：插入录制结束即刻落盘快照，`u`/`<C-r>` 基于索引切换并保留 lastChange，恢复光标行为贴合 Vim
- 🧮 可重复操作修复：`iZ`/`aY`、`x` 等组合在 `.` 重放和 redo 后保持光标与寄存器一致，`dd` 删除后保留列位置
- ✂️ 标点 `cw` 范围与移动边界修正：仅修改当前标点段，`w` 在文件末尾落在最后字符
- 🧪 Neovim 对拍：`vimParityExhaustive.test.ts` 全量通过

### v0.15.0
- 🔧 修复 Insert 模式核心问题：引入 `insertCol` 分离光标显示与插入位置，修复 c$/cw/Escape 等命令行为
- ✅ 建立 Neovim 对拍测试系统：headless 模式对比真实 Vim，生成全面组合测试（序列长度 1-3，覆盖所有已实现功能）
- 📊 大幅提升测试通过率：从 72% (291/404) 提升到 79% (319/404)
- 🐛 修复 d$ 等操作符边界情况 bug

### v0.14.0
- 🧩 英文课程文案全部迁移到 `en/lessons.json`，页面不再依赖 defaultValue，彻底消除 TRANSLATION MISSING
- ✅ 新增 i18n 结构与完整性测试：校验所有 locale 的 lessons/namespace 键类型一致、覆盖全部分类与课程序号
- 🔧 修复中文版/活泼版课程翻译结构缺失（tracks/steps/keys/goals 对齐），确保 Run Example 与 Challenge 文案正常显示

### v0.13.0
- 🎨 移动端 Header 重设计：Logo/标题左对齐，新增语言切换按钮，所有按钮右侧均匀排布（上一课、下一课、语言、设置、侧栏、GitHub）
- 📱 移动端设置面板优化：紧凑布局（95vw 宽度 + 3列字体选项 + 简化预览代码），移除标题栏和关闭按钮
- 🔧 修复 UI 问题：字号滑块居中对齐（webkit + moz），课程切换自动滚动到顶部（跨浏览器兼容）

### v0.12.0
- 📱 全面移动端响应式优化：实现智能侧边栏（移动端可切换，桌面端自动展开），汉堡菜单按钮集成，遮罩层点击关闭
- 🎨 智能 Header 设计：移动端顶栏集成 Logo、菜单、导航与操作按钮，滚动向下自动隐藏，向上滚动重新出现，节省屏幕空间
- 🗂️ 侧边栏空间优化：移动端隐藏侧边栏顶部 Logo 和标题以节省纵向空间，桌面端保留完整品牌展示
- 📐 响应式细节优化：浮动按钮移动端集成到顶栏（桌面端保持右下角），VimChallenge 编辑器高度适配（移动端 500px，桌面端 600px），内容边距优化
- 🔧 完善 i18n 支持：新增 menu、prevLesson、nextLesson 翻译键（英文和中文）

### v0.11.0
- 🧭 新增课程导航与 GitHub 链接：右下角悬浮按钮支持上一课/下一课快速跳转，添加 GitHub Star 按钮（支持 i18n）
- 💾 实现学习进度记忆：首次点击"开始学习"后自动记住状态，之后访问直接进入课程页，点击"首页"可重置
- 🎨 全面优化 UI 体验：消除白屏闪烁（深色加载动画），紧凑侧边栏布局，语言切换器改用短标签（Eng/中/活），悬浮按钮样式优化（更亮背景+边框）
- 🐛 修复课程内容显示问题：RunExample 切换课程黑屏、中文/活泼版 lessons.json 索引错位（补全"示例"翻译并重排内容索引）

### v0.10.1
- 🎨 优化设置面板布局：Tab 栏从左侧改为顶部，面板尺寸增大以适应更长的代码预览
- 🔤 实现字体按需加载系统：Google Fonts 动态加载，系统字体自动 fallback
- 📝 更新字体列表：新增 10 个等宽字体选项（Consolas、Fira Code、JetBrains Mono、Cascadia Code 等）
- 🐛 修复外观设置预览代码缩进不显示的问题（添加 `whitespace-pre`）
- 🌐 修复首页按钮缺少 i18n 支持
- 🗣️ 简化语言菜单显示（移除括号中的语言说明）

### v0.10.0
- 🗣️ 新增「中文（活泼）」 i18n 方案：为课程文案提供更具故事感和引导感的中文活泼版
- 📚 为 Chapter 1–6 撰写活泼版课程文案（zh-lively/lessons.json），按章节覆盖 modes/motions、word/WORD、小编辑、操作符、文本对象、find/till、搜索重构等内容
- 🧠 形成统一的活泼版文案规范（tmp/plans/zh-lively.md），包括语气风格、术语处理、情绪价值与教学结构

### v0.9.0
- 🌐 引入 i18next + react-i18next，支持多语言（英文/中文）与语言检测、切换器
- 🧭 全站文案 i18n 化：布局、首页、课程页、挑战/Run Example/设置面板均接入翻译
- 📚 课程内容支持翻译键：章节标题、课程标题/简介、Markdown、示例步骤、挑战目标均可多语言
- 🐛 修复 Run Example 在未初始化回调时的运行时错误（黑屏问题）

### v0.8.0
- ✨ 新增设置面板系统：支持自定义编辑器字体和字号（默认 Consolas 16px）
- 🎨 重构编辑器排版：应用业界标准配置（CSS 变量、动态样式更新）
- 🖼️ 细节样式优化

### v0.7.1
- 🎨 改进编辑器排版：应用业界标准样式配置（14px 字号、1.5 行高、flex 布局）
- 🔧 统一 VimChallenge 和 RunExamplePlayer 编辑器样式

### v0.7.0
- 🧹 核心 Vim 引擎重构：抽离历史/录制/粘贴公共工具，拆分 reducer 逻辑，降低重复和边界处理复杂度

### v0.6.0
- ✨ 新增 Chapter 4-6 课程：find/till 精准编辑、文本对象、搜索/重构关卡
- 🔍 实现搜索能力 `/ ? n N * #`，支持重复匹配跳转
- 🧩 新增文本对象 `iw/aw/ip/ap/()`/`{}`/`[]`/`""`，可与 d/c/y 组合
- 🧪 添加文本对象与搜索路径的单元测试

### v0.5.1
- 🐛 修复 `.` 重放在 `cw`/`c$`/粘贴/计数覆盖等场景的边界问题，点命令测试全绿
- 🔄 优化 Undo/Redo 历史记录，确保重做正确恢复最新变更
- 🧭 调整 `w`/`e` 动作与寄存器行为，末尾空格处理更贴近预期
- ✅ 176/176 单元测试全面通过

### v0.5.0
- ✅ 建立完整的单元测试系统（Vitest）
- 📊 176 个测试用例，覆盖所有 Vim 引擎核心功能
- 🧪 测试覆盖：motions、operators、vimReducer、dot-command
- 📈 86%+ 通过率，核心功能 100% 验证

### v0.4.0
- ✨ 新增 `.` 命令 - 重复上次修改操作
- 🏗️ 重构 VimState，新增按键记录机制
- 📚 支持 count prefix 覆盖（如 `3x` 后可用 `2.` 覆盖）

### v0.3.0
- ✨ 新增 Chapter 3 - 高级编辑课程
- ✨ 实现 Undo/Redo 系统（`u`, `Ctrl-r`）
- ✨ 实现 Yank/Paste 功能（`y`, `p`, `P`）
- ✨ 支持数字前缀（`3w`, `5dd` 等）
- ✨ 实现字符查找（`f`, `F`, `t`, `T`, `;`, `,`）

### v0.2.0
- ✨ 新增 Chapter 1-2 课程
- ✨ 实现 Run Example 可播放示例功能
- ✨ 支持 Markdown 渲染
- 🎨 完善 UI 样式和交互

### v0.1.0
- 🎉 项目初始化
- 🏗️ 模块化架构搭建
- 🔧 基础 Vim 引擎实现
- 📦 课程系统框架

</details>

## Star历史

<a href="https://www.star-history.com/#Jerry-Terrasse/vimprove&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Jerry-Terrasse/vimprove&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Jerry-Terrasse/vimprove&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Jerry-Terrasse/vimprove&type=date&legend=top-left" />
 </picture>
</a>
