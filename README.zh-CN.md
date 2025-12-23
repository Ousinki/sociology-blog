# 社会学研究博客

基于 [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) 模板构建的社会学博客网站，集成了 Recharts 图表库用于数据可视化。

## 🚀 快速开始

### 开发环境

```bash
npm install
npm run dev
```

访问 `http://localhost:3000` 查看网站。

### 生产构建

```bash
npm run build
npm run serve
```

## 📊 图表组件

项目包含三个社会学数据可视化组件：

- `SociologyBarChart` - 条形图（调查结果、分类数据）
- `SociologyLineChart` - 折线图（趋势分析、时间序列）
- `SociologyPieChart` - 饼图（比例分布、结构分析）

### 使用示例

在 MDX 文件中：

```mdx
import { SociologyBarChart } from '@/components/charts'

export const data = [
  { category: '选项A', value: 100 },
  { category: '选项B', value: 200 },
]

<SociologyBarChart data={data} title="调查结果" xAxisLabel="选项" yAxisLabel="人数" />
```

查看 `data/blog/sociology-data-visualization.mdx` 获取完整示例。

## 📝 创建博客文章

在 `data/blog/` 目录创建新的 `.mdx` 文件：

```mdx
---
title: '文章标题'
date: '2025-12-23'
tags: ['社会学', '数据分析']
draft: false
summary: '文章摘要'
---

# 文章内容

可以使用 Markdown 和 React 组件！
```

## ⚙️ 配置

### 网站信息

编辑 `data/siteMetadata.js` 文件，更新：

- 网站标题、描述
- 作者信息
- 社交媒体链接
- 部署后的 URL

### 环境变量

复制 `.env.example` 为 `.env`，根据需要配置：

- Giscus 评论系统（可选）
- Newsletter 订阅（可选）
- 分析工具（可选）

## 🚀 部署到 Vercel

1. 推送代码到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入 GitHub 仓库
4. Vercel 自动检测 Next.js 并部署

## 📚 技术栈

- **框架**: Next.js 15
- **样式**: Tailwind CSS 4
- **图表**: Recharts 3
- **内容**: MDX + Contentlayer
- **部署**: Vercel

## 📖 文档

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Recharts 文档](https://recharts.org/)
- [原始模板文档](https://github.com/timlrx/tailwind-nextjs-starter-blog)

## 📄 许可证

MIT
