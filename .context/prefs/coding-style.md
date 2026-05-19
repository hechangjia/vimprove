# Coding Style Guide

> 此文件定义团队编码规范，所有 LLM 工具在修改代码时必须遵守。
> 提交到 Git，团队共享。

## General
- Prefer small, reviewable changes; avoid unrelated refactors.
- Keep functions short (<50 lines); avoid deep nesting (≤3 levels).
- Name things explicitly; no single-letter variables except loop counters.
- Handle errors explicitly; never swallow errors silently.

## Language-Specific

### TypeScript (本项目主语言)
- 启用 `strict: true`；不要绕过类型系统（避免 `as any` / `@ts-ignore`，必要时用类型守卫）
- 优先用 `type` 别名表达 discriminated union；`interface` 用于可被扩展的对象形状
- 路径别名使用 `@/`（见 `tsconfig.app.json`）；禁止深度相对路径 `../../../`
- React 组件：函数组件 + hooks；副作用必须在 `useEffect` 中且明确 cleanup
- 状态更新走 reducer / 显式 setter；禁止直接 mutate state
- 注释语言与文件现有注释保持一致（本项目以中文为主）

## Git Commits
- Conventional Commits, imperative mood.
- Atomic commits: one logical change per commit.
- 中文项目 commit message 优先英文，主体可用列表分组描述影响

## Testing
- 引擎纯函数变更 MUST 配套 vitest 单测（参考 `src/core/*.test.ts`）
- UI / hook 变更优先手测 + Run Example 覆盖
- 测试输出过滤：`npx vitest run --pool=threads ... 2>&1 | grep -EA20 "Failed Tests|Test Files"`
- Fix flow: 优先写一个能复现 bug 的失败测试，再修复

## Security
- Never log secrets (tokens/keys/cookies/JWT).
- Validate inputs at trust boundaries.
- localStorage 仅存储非敏感的偏好 / 进度数据
