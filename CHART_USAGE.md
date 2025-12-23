# 社会学博客 - 图表组件使用说明

## ⚠️ 当前状态

图表组件已创建，但由于 Next.js 15 + React 19 + Contentlayer 的兼容性问题，**暂时无法在 MDX 文件中直接使用**。

### 问题原因

- Next.js 15 使用 React Server Components (RSC)
- Recharts 依赖客户端功能（如 `createContext`）
- Contentlayer MDX 处理方式与 RSC 存在兼容性问题

## ✅ 已创建的组件

三个图表组件已成功创建在 `components/charts/` 目录：

1. **SociologyBarChart.tsx** - 条形图
2. **SociologyLineChart.tsx** - 折线图
3. **SociologyPieChart.tsx** - 饼图

所有组件都已标记为 `'use client'`，可以在常规 React/Next.js 页面中使用。

## 🔧 解决方案

### 选项 1：在常规页面中使用（推荐）

在 `app/` 目录创建专门的数据可视化页面：

```typescript
// app/data-viz/page.tsx
'use client'

import { SociologyBarChart } from '@/components/charts'

export default function DataVizPage() {
  const data = [
    { category: '选项A', value: 100 },
    { category: '选项B', value: 200 },
  ]

  return (
    <div className="container mx-auto py-8">
      <h1>数据可视化</h1>
      <SociologyBarChart
        data={data}
        title="示例图表"
      />
    </div>
  )
}
```

### 选项 2：升级依赖（需要测试）

可能需要：

- 升级 Contentlayer 到支持 RSC 的版本
- 或降级到 Next.js 14

### 选项 3：使用 MDX 组件包装器

创建一个特殊的 MDX 组件包装器，但这需要修改 Contentlayer 配置。

## 📝 临时方案

当前建议：

1. **博客文章继续使用纯 Markdown**（不含图表）
2. **创建专门的数据可视化页面**（使用选项 1）
3. **在博客中链接到数据可视化页面**

示例：

```markdown
## 数据分析

详细的数据可视化请查看：[数据可视化页面](/data-viz/survey-results)
```

## 🔄 后续计划

1. 测试 Contentlayer 替代方案（如 next-mdx-remote）
2. 检查是否有 Contentlayer 更新支持 Next.js 15
3. 考虑创建独立的数据可视化应用部分

## 📚 参考资料

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Recharts 文档](https://recharts.org/)
- [Contentlayer Issue Tracker](https://github.com/contentlayerdev/contentlayer/issues)

---

**注意**：图表示例文章 `sociology-data-visualization.mdx` 已标记为草稿（`draft: true`），不会在博客列表中显示，避免错误。
