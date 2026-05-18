[根目录](../../CLAUDE.md) > [src](../) > **i18n**

# i18n — 多语言支持

## 模块职责

把 i18next 集成到 React，并按"命名空间 + 语言"组织所有文案。课程内容的翻译也走同一套体系（不和 UI 文案混用）。

## 入口与启动

### `config.ts`
- 用 Vite 的 `import.meta.glob('./locales/*/*.json', { eager: true })` 在构建时把所有 JSON 内联进 bundle
- 通过路径正则 `./locales/{lng}/{ns}.json` 切分为 `resources[lng][ns]`
- 配置 `LanguageDetector`（querystring → localStorage → navigator）+ `initReactI18next`
- 导出：`initI18n()`、`supportedLocales`、`defaultNS = 'common'`、`type LocaleCode`

### `index.ts`
- 仅 re-export `initI18n` / `supportedLocales` / `defaultNS` / `LocaleCode`

被 `src/main.tsx` 在渲染前 `await initI18n()`，再用 `<I18nextProvider i18n={instance}>` 包裹 `<App />`。

## 支持的语言

| code | label | nativeLabel | shortLabel |
| --- | --- | --- | --- |
| `en` | English | English | Eng |
| `zh` | Chinese | 中文 | 中 |
| `zh-lively` | Chinese (Lively) | 中文（活泼） | 活 |

`shortLabel` 用于侧边栏/移动端 Header 的小按钮；`nativeLabel` 用于下拉菜单。

## 命名空间清单

```
src/i18n/locales/<locale>/
├── common.json       # 通用词汇（也是 defaultNS）
├── layout.json       # Sidebar / MobileHeader
├── home.json         # 首页文案
├── lesson.json       # 课程页脚手架（章节标题、上一课/下一课 ...）
├── challenge.json    # 挑战编辑器（计时、目标完成 ...）
├── example.json      # Run Example 控件
├── settings.json     # 设置面板（含 Tab 标题、字体名 ...）
├── lessons.json      # 课程内容翻译（按 slug 索引）
└── keyHistory.json   # 按键历史面板
```

> 英文版的 `lessons.json` 会兜底所有 slug；中文 / zh-lively 也保留完整结构以便后续单测校验"键集合一致"。

## 关键约束

1. **英文课程内容直接位于 `src/data/lessons/**/*.ts`**——`lessons.json` 在 `en` 下主要存常用键，避免重复。
2. **课程 i18n 索引约束（极易出错）**：`LessonView` 按 `lessons.{slug}.content.{idx}` 渲染 contentBlocks。
   - 错误：把段落直接写在顶层 `lessons.{slug}.content.0`（应该是 `content: { "0": "..."}`）
   - 错误：让一个段落的翻译变成对象类型 → `returned an object instead of string`
   - 顺序必须与 `.ts` 的 contentBlocks 完全一致
3. **JSON 引号规范**：必须使用半角 `"`；引用代码/字符时内层引号要转义 `"按 \"u\" 撤销"`，禁止全角 `""` 引号（会破坏 JSON 语法）。
4. **翻译质量**：不要逐句直译，要保留教学相关的联想（如 `i → insert` 的助记在中文中保留 `i -> 插入(Insert)`）。
5. **新增语言流程**：
   1. 在 `locales/` 下新建文件夹，复制所有 ns 文件并翻译
   2. 在 `config.ts` 的 `supportedLocales` 数组追加 `{ code, label, nativeLabel, shortLabel }`
   3. 无需改动 Vite glob 或其他代码（自动发现）

## 使用模式

```tsx
// 业务组件
import { useTranslationSafe } from '@/hooks/useI18n';
const { t } = useTranslationSafe('challenge');
t('goalCompleted', 'Goal complete!');   // defaultValue 仅作记号，missing 会显示 'TRANSLATION MISSING'

// 课程内容（LessonView）
const title = locale !== 'en'
  ? t(`lessons.${lesson.slug}.title`, lesson.title)
  : lesson.title;
```

## 关键依赖

- `i18next` ^25
- `react-i18next` ^16
- `i18next-browser-languagedetector` ^8
- Vite 的 `import.meta.glob` 静态分析（构建时确定 JSON 列表）

## 测试与质量

- 历史上曾有专门的 i18n 结构校验测试（参见 README v0.14.0 CHANGELOG："新增 i18n 结构与完整性测试：校验所有 locale 的 lessons/namespace 键类型一致"）
- 修改翻译后建议：
  - `npm run dev` 切到对应语言巡检
  - 检查 console 是否报 `returned an object instead of string`
  - `npm run test` 确保未引入引擎回归

## 相关文件清单

```
src/i18n/
├── config.ts              # initI18n + supportedLocales + types
├── index.ts               # re-export
└── locales/
    ├── en/{9 ns}.json
    ├── zh/{9 ns}.json
    └── zh-lively/{9 ns}.json
```

外部规划文档（位于 .gitignore 的 `tmp/`）：
- `tmp/plans/zh-lively.md` — zh-lively 文案风格规范

## 变更记录 (Changelog)

- 2026-05-18 初始化模块级 CLAUDE.md（init-architect 自动生成）
