[根目录](../../CLAUDE.md) > [src](../) > **pages**

# pages — 页面级组件

## 模块职责

承担"页面壳"的角色：决定一页该长什么样，把数据 / hooks / 组件粘起来。本项目目前没有路由库（不用 react-router 的路由表，而是 `App.tsx` 内部用 `currentView` state 切换），所以本目录非常薄。

## 入口与启动

页面由 `src/App.tsx` 根据 `currentView: 'home' | 'lesson'` 直接渲染：

```tsx
{currentView === 'home'
  ? <HomePage onStart={handleStartLearning} />
  : <LessonPage lesson={currentLesson} onNext={...} onPrev={...} />}
```

## 对外接口

### `HomePage.tsx`
- Props: `{ onStart: () => void }`
- 首页：Logo + 标语 + 三大特性卡片（Real Engine / Gamified / Interactive） + "开始学习"按钮 + 语言切换下拉 + 版本 badge
- 直接消费 `useTranslationSafe('home')` 和 `useLocale()`

### `LessonPage.tsx`
- Props: `{ lesson: Lesson; onNext?: () => void; onPrev?: () => void }`
- 实质上是 `<LessonView lesson onNext onPrev />` 的薄壳
- 该层级保留以便将来插入"加载状态 / 错误边界 / 路由切换动画"

## 关键约束

1. **不在 page 层处理 localStorage / 路由状态**：那些都在 `App.tsx`（避免重复读写）
2. **不在 page 层调用 reducer**：把交互交给 `LessonView → VimChallenge` 等下层组件
3. **i18n**：HomePage 自己用 `home` 命名空间；LessonPage 完全透传给 `LessonView`

## 相关文件清单

```
src/pages/
├── HomePage.tsx     # 首页（特性卡 + 开始学习）
└── LessonPage.tsx   # 课程页薄壳 → LessonView
```

## 变更记录 (Changelog)

- 2026-05-18 初始化模块级 CLAUDE.md（init-architect 自动生成）
