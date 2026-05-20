[根目录](../../CLAUDE.md) > [src](../) > **data**

# data — 课程数据（配置驱动）

## 模块职责

把课程内容当作**数据**而不是代码：每节课是一个 `Lesson` 对象，通过 `contentBlocks` 数组声明 Markdown / key-list / challenge / run-example / hjkl-snake 几种"块"。新增课程只需新建 `.ts` 文件并在 `index.ts` 注册，无需修改 UI 或引擎。

## 入口与启动

- `index.ts` — 汇总所有 Lesson 并按章节顺序导出 `LESSONS: Lesson[]`，同时 re-export `CATEGORIES`
- `categories.ts` — 14 个章节的 id / title / order

被 `src/App.tsx` 直接消费：根据 `currentLessonSlug` 在 `LESSONS` 中查找当前 Lesson。

## 对外接口

```ts
import { LESSONS, CATEGORIES } from '@/data';
import type { Lesson, Category, ContentBlock } from '@/core/types';
```

类型在 `@/core/types.ts`，本模块**只产出数据、不暴露函数**。

## 课程结构

### 章节分类（来自 `categories.ts`）

| id | title | 课程数 |
| --- | --- | --- |
| chapter1 | Vim Mindset & Basic Motions | 8 |
| chapter2 | Word Navigation & Small Edits | 5 |
| chapter3 | Advanced Editing | 8 |
| chapter4 | In-line Find & Till | 4 |
| chapter5 | Text Objects | 5 |
| chapter6 | Search & Refactor | 4 |
| chapter7 | Visual Mode | 5 |
| chapter8 | Macros & Registers | 5 |
| chapter9 | Marks & Jump History | 3 |
| chapter10 | Vim in the Real World | 6 |
| chapter11 | Daily Vim Mastery | 4 |
| chapter12 | Project Navigation | 4 |
| chapter13 | Screen Navigation | 4 |
| chapter14 | Project Workspace | 4 |

**合计 69 节可见课程。**

### Lesson 文件分布（来自 `index.ts`）

```
src/data/lessons/
├── chapter1/
│   ├── modes-basics.ts
│   ├── motions-hjkl.ts
│   ├── motions-line-bounds.ts
│   ├── motions-file-bounds.ts
│   ├── motions-paragraph.ts
│   ├── motions-bracket-match.ts
│   ├── modes-movement-mini-review.ts
│   └── hjkl-snake.ts                 # 末尾贪吃蛇小游戏
├── chapter2/
│   ├── motions-words.ts
│   ├── words-fix-small-things.ts
│   ├── motions-words-big.ts          # WORD 移动（W/B/E）
│   ├── small-edits-chars.ts
│   └── words-mini-review.ts
├── chapter3/
│   ├── operator-delete-basic.ts
│   ├── operator-change-basic.ts
│   ├── operator-yank-basic.ts
│   ├── count-repeat-undo.ts
│   ├── operators-mini-review.ts
│   ├── operator-shortcuts.ts
│   ├── operator-case.ts
│   └── game-2048.ts                  # 末尾 2048 小游戏
├── chapter4/
│   ├── find-char.ts
│   ├── delete-with-find.ts
│   ├── change-with-find.ts
│   └── in-line-precision-review.ts
├── chapter5/
│   ├── textobjects-words.ts
│   ├── textobjects-paragraphs.ts
│   ├── textobjects-brackets.ts
│   ├── textobjects-quotes.ts
│   └── textobjects-mega-review.ts
├── chapter6/
│   ├── search-basic.ts
│   ├── search-with-operators.ts
│   ├── realworld-cleanup-1.ts
│   └── speedrun-challenge.ts
├── chapter7/
│   ├── visual-char-basics.ts
│   ├── visual-line-mode.ts
│   ├── visual-block-mode.ts
│   ├── visual-operators.ts
│   └── visual-refactor-review.ts
├── chapter8/
│   ├── macros-basics.ts
│   ├── macros-count.ts
│   ├── registers-named.ts
│   ├── registers-system.ts
│   └── macros-mega-challenge.ts
├── chapter9/
│   ├── marks-basics.ts
│   ├── jumplist.ts
│   └── changelist.ts
├── chapter10/
│   ├── install-and-minimal-config.ts
│   ├── vim-in-vscode.ts
│   ├── vim-in-jetbrains.ts
│   ├── vim-in-terminal.ts
│   ├── editor-shortcut-migration.ts
│   └── realworld-refactor-demo.ts
├── chapter11/
│   ├── command-line-basics.ts
│   ├── substitute-current-line.ts
│   ├── substitute-whole-buffer.ts
│   └── first-week-workflow-review.ts
└── chapter12/
    ├── buffer-list-basics.ts
    ├── switch-buffers.ts
    ├── split-windows.ts
    └── project-navigation-review.ts
└── chapter13/
    ├── screen-scroll-basics.ts
    ├── viewport-positioning.ts
    ├── screen-line-jumps.ts
    └── screen-navigation-review.ts
└── chapter14/
    ├── workspace-mental-model.ts
    ├── project-search-vimgrep.ts
    ├── quickfix-navigation.ts
    └── project-workspace-review.ts
```

### 单个 Lesson 形状

```ts
{
  slug: string;                  // 路由/i18n 主键，全局唯一
  title: string;                 // 英文标题（同时作为 en 默认值）
  categoryId: string;            // 'chapter1' ~ 'chapter14'
  shortDescription: string;      // 列表/页眉副标题
  contentBlocks: ContentBlock[]; // markdown | key-list | challenge | run-example | minigame | cheat-sheet
  i18nKey?: string;              // 可选；缺省时按 `lessons.{slug}.*` 解析
}
```

## 关键约束

1. **新课流程**：参考 `tmp/lesson-template.ts`（被 .gitignore，但仓库可见）→ 在 `src/data/index.ts` 添加 import + push 到 `LESSONS`。无需触碰其它代码。
2. **顺序即课程顺序**：`LESSONS` 数组顺序决定侧边栏与上一课/下一课导航。
3. **i18n 索引约束**（极易出错）：在 `LessonView` 中按 `lessons.{slug}.content.{idx}` 渲染。zh / zh-lively 的 `lessons.json` 必须保证 `content` 是对象、key 为字符串数字（"0" / "1" / ...），顺序与 .ts 中 `contentBlocks` 对齐。若某索引位是 markdown 但翻译被写成对象，会触发 i18next 的 "returned an object instead of string"。
4. **英文内容直接在 .ts 中**：英文是默认值，其它语言走 JSON 翻译，避免重复。
5. **新增/修改课程的副产物**：必须同步更新 `src/i18n/locales/zh/lessons.json` 和 `src/i18n/locales/zh-lively/lessons.json`。
6. **goalsRequired 与 goals.length 不必相等**：用于"至少完成 N 个目标即过关"的弹性玩法（在文本对象/搜索章节常见）。

## ChallengeGoal Validator 提示

validator 收到 `(prev, next, lastCommand)`，**禁止依赖鼠标选择/原生粘贴**——只承认通过 `vimReducer` 产生的状态变化。常见模式：
- `next.cursor.line === N` — 检查光标位置
- `next.buffer.join('\n') === expected` — 检查 buffer 内容
- `lastCommand?.type === 'delete-range'` — 检查产生此态的命令
- `next.register === '...'` — yank 后的寄存器内容

## 测试与质量

本模块没有自己的单测；但 i18n 结构校验在历史上由 `src/i18n/__tests__` 等检查覆盖（参考 v0.14.0 CHANGELOG）。修改课程后建议：

```bash
npm run typecheck                  # 类型必须过
npm run dev                        # 手动巡检对应 slug 的渲染
npm run test                       # 跑核心引擎不会回归
```

## 相关文件清单

```
src/data/
├── index.ts            # 汇总入口（注册新课在此）
├── categories.ts       # 14 个章节定义
└── lessons/
    ├── chapter1/  (8 lessons)
    ├── chapter2/  (5 lessons)
    ├── chapter3/  (8 lessons)
    ├── chapter4/  (4 lessons)
    ├── chapter5/  (5 lessons)
    ├── chapter6/  (4 lessons)
    ├── chapter7/  (5 lessons)
    ├── chapter8/  (5 lessons)
    ├── chapter9/  (3 lessons)
    ├── chapter10/ (6 lessons)
    ├── chapter11/ (4 lessons)
    ├── chapter12/ (4 lessons)
    ├── chapter13/ (4 lessons)
    └── chapter14/ (4 lessons)
```

外部协作文档（位于 .gitignore 的 `tmp/`，但仓库可见）：
- `tmp/README-COURSE-COLLAB.md` — 协作流程
- `tmp/course-creation-guide.md` — 课程 AI 的写作规范
- `tmp/lesson-template.ts` — 快速复制模板
- `tmp/run-example-template.md` — 可播放示例的编写说明
- `tmp/tech-support-capabilities.md` — 引擎能力清单

## 变更记录 (Changelog)

- 2026-05-18 初始化模块级 CLAUDE.md（init-architect 自动生成）
