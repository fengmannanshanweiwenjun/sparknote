# 星火笔记 - 自媒体内容管理平台

AI 驱动的小红书/微博/抖音内容创作与管理工具。

## 功能特性

- **AI 智能创作**: 支持多种 AI 接口（OpenAI 兼容 / 通义千问 / 文心一言），一键生成标题、正文、标签
- **实时预览**: 模拟小红书/微博/抖音原生样式，所见即所得
- **多平台管理**: 统一管理小红书、微博、抖音内容
- **一键发布**: 复制内容 + 打开平台发布页，快速发布
- **GitHub 存储**: 数据通过 GitHub API 持久化，跨设备同步
- **内容日历**: 可视化排期管理
- **暗色主题**: 支持亮色/暗色/跟随系统

## 快速开始

### 1. 直接使用

双击 `index.html` 即可在浏览器中打开（需要网络加载 CDN 资源）。

### 2. 本地开发服务器

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 然后访问 http://localhost:8080
```

### 3. 部署到 GitHub Pages

1. 创建 GitHub 仓库
2. 将项目文件推送到仓库
3. 在仓库 Settings → Pages 中启用 GitHub Pages
4. 选择分支部署

## 配置说明

### AI 接口配置

在设置页面配置 AI 提供商：

| 提供商 | 配置项 | 说明 |
|--------|--------|------|
| OpenAI 兼容 | Base URL + API Key + Model | 支持 OpenAI、DeepSeek、Kimi 等 |
| 通义千问 | API Key + Model | 阿里云 DashScope |
| 文心一言 | API Key + Secret Key | 百度智能云 |

### GitHub 存储配置

1. 创建 [GitHub Personal Access Token](https://github.com/settings/tokens)（需要 `repo` 权限）
2. 在设置页面填写 Token 和仓库名（格式：`owner/repo`）
3. 数据将存储在仓库的 `data/` 目录下

## 项目结构

```
xiaohongshu-manager/
├── index.html          # 入口文件
├── css/                # 样式文件
│   ├── main.css        # 全局样式
│   ├── editor.css      # 编辑器样式
│   ├── preview.css     # 预览样式
│   └── components.css  # 组件样式
├── js/                 # JavaScript 模块
│   ├── app.js          # 应用入口
│   ├── stores/         # Pinia 状态管理
│   ├── services/       # API 服务
│   ├── pages/          # 页面组件
│   └── components/     # 通用组件
├── data/               # 数据模板
│   └── prompts.json    # AI 提示词模板
└── README.md
```

## 技术栈

- **Vue 3**: 渐进式 JavaScript 框架（CDN 引入）
- **Pinia**: Vue 状态管理（CDN 引入）
- **ES Modules**: 原生模块系统
- **CSS Variables**: 主题系统
- **GitHub API**: 数据持久化

## 浏览器兼容性

- Chrome 89+
- Firefox 108+
- Safari 16.4+
- Edge 89+

## License

MIT
