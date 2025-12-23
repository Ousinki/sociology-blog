# 🚀 Vercel 部署完整指南

## 📋 前提条件检查

在开始之前，确保您有：

- ✅ GitHub 账号
- ✅ 项目代码在本地运行正常
- ✅ Git 已安装

---

## 步骤 1️⃣：初始化 Git 仓库

### 1.1 检查 Git 状态

```bash
cd /Users/ousin/.gemini/antigravity/scratch/sociology-blog
git status
```

如果显示 "not a git repository"，执行：

```bash
git init
```

### 1.2 添加并提交所有文件

```bash
# 添加所有文件
git add .

# 查看将要提交的文件
git status

# 提交
git commit -m "Initial commit: sociology blog with data visualization"
```

---

## 步骤 2️⃣：创建 GitHub 仓库

### 2.1 访问 GitHub

1. 打开浏览器访问：https://github.com/new
2. 或登录 GitHub 后点击右上角的 "+" → "New repository"

### 2.2 创建仓库配置

填写以下信息：

- **Repository name**: `sociology-blog` （或您喜欢的名称）
- **Description**: 社会学研究博客 - 使用 Next.js 和 Recharts 构建
- **Public/Private**: 选择 Public（公开）或 Private（私有）
- ⚠️ **重要**: **不要**勾选以下选项：
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

（因为本地已有这些文件）

### 2.3 点击 "Create repository"

---

## 步骤 3️⃣：推送代码到 GitHub

创建仓库后，GitHub 会显示一组命令。执行以下步骤：

### 3.1 连接远程仓库

```bash
# 将 YOUR_USERNAME 替换为您的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/sociology-blog.git

# 设置主分支名称
git branch -M main
```

### 3.2 推送代码

```bash
git push -u origin main
```

如果遇到认证问题，可能需要：

- 使用 Personal Access Token（推荐）
- 或配置 SSH 密钥

### 3.3 验证推送成功

访问您的 GitHub 仓库页面，应该能看到所有代码文件。

---

## 步骤 4️⃣：部署到 Vercel

### 4.1 访问 Vercel

打开浏览器访问：**https://vercel.com**

### 4.2 登录/注册

点击右上角 "Sign Up" 或 "Log In"

**推荐方式**：使用 GitHub 账号登录

- 点击 "Continue with GitHub"
- 授权 Vercel 访问您的 GitHub

### 4.3 导入项目

登录后，您会看到 Dashboard：

1. 点击 **"Add New..."** → **"Project"**
2. 或直接点击 **"Import Project"**

### 4.4 选择 GitHub 仓库

1. 在 "Import Git Repository" 页面
2. 找到 `sociology-blog` 仓库
3. 点击 **"Import"**

如果看不到仓库：

- 点击 "Adjust GitHub App Permissions"
- 授权 Vercel 访问该仓库

### 4.5 配置项目

Vercel 会自动检测到 Next.js 项目：

**项目配置（通常保持默认即可）：**

```yaml
Framework Preset: Next.js # 自动检测
Root Directory: ./ # 保持默认
Build Command: npm run build # 自动设置
Output Directory: .next # 自动设置
Install Command: npm install # 自动设置
```

**环境变量（可选）：**

如果需要配置环境变量（如评论系统），点击 "Environment Variables"：

- 变量名示例：
  - `NEXT_PUBLIC_GISCUS_REPO`
  - `NEXT_PUBLIC_GISCUS_REPOSITORY_ID`
  - 等等（来自 `.env` 文件）

⚠️ **注意**：环境变量可以稍后在项目设置中添加。

### 4.6 开始部署

点击 **"Deploy"** 按钮！

---

## 步骤 5️⃣：等待部署完成

### 5.1 部署进度

Vercel 会显示部署过程：

1. ⏳ **Building** - 构建项目（约 2-5 分钟）
2. ⏳ **Deploying** - 部署到 CDN
3. ✅ **Ready** - 部署完成！

### 5.2 部署成功

看到 **"Congratulations!"** 页面后：

- 🎉 您的网站已上线！
- 会得到一个 Vercel 域名，类似：
  - `sociology-blog-xxx.vercel.app`
  - 或 `your-project.vercel.app`

### 5.3 访问网站

1. 点击 **"Visit"** 或 **"Go to Dashboard"**
2. 记下您的网站 URL

---

## 步骤 6️⃣：更新网站配置

### 6.1 更新 siteMetadata.js

部署成功后，更新配置文件：

```javascript
// data/siteMetadata.js
siteUrl: 'https://your-project.vercel.app',  // 更新为实际 URL
siteRepo: 'https://github.com/YOUR_USERNAME/sociology-blog',
```

### 6.2 提交并推送更新

```bash
git add data/siteMetadata.js
git commit -m "Update site URL with Vercel deployment"
git push
```

Vercel 会**自动重新部署**！（约 1-2 分钟）

---

## 步骤 7️⃣：配置环境变量（可选）

如果需要配置评论系统或其他服务：

### 7.1 进入项目设置

1. 访问 Vercel Dashboard
2. 选择您的项目
3. 点击顶部的 **"Settings"**
4. 左侧菜单选择 **"Environment Variables"**

### 7.2 添加环境变量

示例（Giscus 评论系统）：

1. 访问 https://giscus.app 获取配置
2. 在 Vercel 添加变量：

```
NEXT_PUBLIC_GISCUS_REPO = your-username/sociology-blog
NEXT_PUBLIC_GISCUS_REPOSITORY_ID = R_xxx...
NEXT_PUBLIC_GISCUS_CATEGORY = General
NEXT_PUBLIC_GISCUS_CATEGORY_ID = DIC_xxx...
```

3. 选择环境：**Production**, **Preview**, **Development**（全选）
4. 点击 **"Save"**

### 7.3 重新部署

添加环境变量后：

1. 前往 **"Deployments"** 标签
2. 找到最新部署
3. 点击右侧 **"..." → "Redeploy"**

---

## 步骤 8️⃣：配置自定义域名（可选）

### 8.1 购买域名

从域名注册商购买域名，如：

- Namecheap
- GoDaddy
- 阿里云
- 腾讯云

### 8.2 在 Vercel 添加域名

1. 项目设置 → **"Domains"**
2. 输入您的域名（如 `blog.yoursite.com`）
3. 点击 **"Add"**

### 8.3 配置 DNS

Vercel 会提供 DNS 记录，在域名注册商添加：

**方式 1: CNAME 记录**（推荐）

```
Type: CNAME
Name: blog (或 www)
Value: cname.vercel-dns.com
```

**方式 2: A 记录**

```
Type: A
Name: @
Value: 76.76.21.21
```

### 8.4 等待 DNS 生效

- 通常需要 5 分钟 - 48 小时
- Vercel 会自动配置 SSL 证书（HTTPS）

---

## 🔄 后续更新流程

每次修改代码后：

```bash
# 1. 添加修改
git add .

# 2. 提交
git commit -m "描述您的修改"

# 3. 推送
git push
```

**Vercel 会自动重新部署！** ✨

---

## ✅ 部署检查清单

完成部署后，验证以下功能：

- [ ] 首页正常显示
- [ ] 博客列表可访问
- [ ] 数据可视化页面 (`/data-viz`) 图表正常显示
- [ ] 导航菜单正常工作
- [ ] 深色/浅色主题切换正常
- [ ] 响应式设计在移动端正常
- [ ] SEO 元数据正确（在浏览器标签查看）

---

## 🎯 Vercel Dashboard 功能

### Analytics（分析）

- 查看访问量、页面浏览等数据
- 需要升级到 Pro 计划

### Deployments（部署历史）

- 查看所有部署记录
- 可以回滚到之前的版本

### Logs（日志）

- 查看构建和运行日志
- 排查问题

### Settings（设置）

- 环境变量
- 自定义域名
- 构建配置
- 等等

---

## ❓ 常见问题

### Q: 部署失败怎么办？

1. 查看 Vercel 的构建日志
2. 确保本地 `npm run build` 可以成功
3. 检查是否有未提交的 `.env` 文件需要作为环境变量添加

### Q: 如何回滚到之前的版本？

1. Deployments → 选择之前的部署
2. 点击 "..." → "Promote to Production"

### Q: 可以使用免费计划吗？

✅ 可以！Vercel 免费计划包括：

- 无限个人项目
- 自动 HTTPS
- 每月 100GB 带宽
- 每次部署 6GB 存储

### Q: 多久部署一次？

每次 `git push` 到 main 分支，Vercel 自动部署（约 1-3 分钟）。

---

## 🎉 完成！

您的社会学博客现在已成功部署到 Vercel！

**分享您的网站**：`https://your-project.vercel.app`

需要帮助？查看：

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
