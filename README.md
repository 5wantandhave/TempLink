# TempLink ⚡

> A minimal text-only ephemeral transfer tool built for Cloudflare Pages + KV.

一个极简的临时文本传输工具：
输入文本 → 生成 6 位 Code / 链接 / 二维码 → 对方秒读 → 自动销毁。

> 🌐 **在线体验**: [TempLink](https://templink.openjoy.asia)

---

## ✨ 项目定位

TempLink 当前只做**临时文本传输**：

* 临时文本/代码片段传递
* 跨设备快速获取
* 自动过期销毁
* 可选阅后即焚

**不做的事**：

* ❌ 文件上传
* ❌ 云存储/网盘
* ❌ 历史记录/长期归档

---

## 🚀 功能特性

* 纯文本传输，最多 100KB
* 自动生成 6 位 Code + 分享链接
* 自动生成二维码
* 过期时间可选：5 分钟 / 30 分钟 / 2 小时 / 24 小时
* 支持“阅后即焚”
* 过期 / 已消费 / 不存在 状态提示
* 一键复制链接和内容
* 访问 `/ABC123` 可直接读取内容
* 结果页使用紧凑卡片布局，左侧展示 Code、链接、操作，右侧展示二维码
* 发送和接收都采用可调节高度的长文本输入域，适合长文本和代码片段

---

## 🧠 核心设计

* 数据不需要被保存，只需要被传递
* 极简接口，只保留文本传输链路
* 过期由 KV TTL 与应用层时间戳共同保障
* 一次消费模式通过 `consumed` 标记实现

---

## ⚙️ 技术栈

* **Runtime**: Cloudflare Pages + Advanced Mode Worker
* **Framework**: Hono
* **Storage**: Cloudflare Workers KV
* **Build**: esbuild + static HTML copy
* **Frontend**: 单页 HTML + 内联 CSS/JS

---

## 📦 项目结构

```text
src/
  public/index.html     # 前端页面
  handlers/upload.ts    # 上传逻辑
  handlers/download.ts  # 下载逻辑
  utils/code.ts         # 6 位码生成
  utils/kv.ts           # KV 存取与过期/消费判断
  utils/qr.ts           # SVG 二维码生成
  worker.ts             # Hono 入口与路由
build.mjs               # 构建脚本
wrangler.toml           # Cloudflare Pages/KV 配置
```

---

## 🔄 数据流

### 📤 发送

```text
Client
  -> POST /api/upload
  -> Worker 生成 code + session
  -> KV 写入（TTL）
  -> 返回 code/link/expire_at/one_time
```

### 📥 接收

```text
Client
  -> GET /api/download/:code
  -> Worker 读取 KV
  -> 检查过期/已消费
  -> 返回文本内容
```

---

## 🔑 API 说明

### POST /api/upload

请求使用 `multipart/form-data`：

| 字段 | 必选 | 说明 |
|------|------|------|
| `text` | 是 | 文本内容，最大 100KB |
| `expiry` | 否 | `5m` / `30m` / `2h` / `24h`，默认 `5m` |
| `one_time` | 否 | `true` 表示阅后即焚 |

### GET /api/download/:code

成功返回：

```json
{
  "type": "text",
  "text_content": "...",
  "one_time": false,
  "expire_at": 1700000000
}
```

错误返回：

* `404 Not found or expired`
* `410 Expired`
* `410 Already consumed`

### GET /api/qr/:code

返回二维码 SVG。

---

## 🛠️ 本地开发

```bash
npm install
npm run dev
# 打开 http://localhost:8788
```

> 本地开发使用 Wrangler 本地 KV 模拟，无需额外配置。

---

## 🚀 部署到 Cloudflare Pages

1. 创建 KV namespace：

```bash
npx wrangler kv namespace create "KV"
```

输出类似 `id = "a1b2c3d4..."`，复制该 ID。

2. 将 ID 写入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "KV"
id = "你刚才拿到的 ID"
```

> KV namespace ID 是标识符而非密钥，写入仓库是安全的。他人拿到 ID 无法访问你的 KV 数据。

3. 确认 Pages 构建输出目录为 `dist`
4. 执行生产构建：

```bash
npm run build
```

部署后即可通过：

* 页面访问根路径发送内容
* `/ABC123` 访问已有内容
* `/api/qr/ABC123` 获取二维码

---

## 🔐 设计边界

* 当前版本只支持文本
* 过期由 KV TTL + 业务时间戳控制
* 一次消费依赖 KV 状态更新
* 不提供账号体系、历史列表、长期存储

---

## 📄 License

MIT
