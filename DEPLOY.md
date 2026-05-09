# DestinyMap 部署上线指南

## 方案一：Vercel 部署（推荐，免费且简单）

### 1. 准备工作

- 注册 [GitHub](https://github.com) 账号
- 注册 [Vercel](https://vercel.com) 账号（用GitHub登录）

### 2. 上传代码到GitHub

```bash
# 在项目根目录执行
git init
git add .
git commit -m "Initial commit"

# 在GitHub创建新仓库，然后执行
git remote add origin https://github.com/你的用户名/destinymap.git
git push -u origin main
```

### 3. Vercel部署

1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库
4. 配置：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 点击 Deploy

### 4. 后端API配置

Vercel部署的是纯前端，后端API需要单独部署：

**选项A：Vercel Serverless Functions**
- 将 `api/` 目录改为 `api/functions/`
- 使用 Vercel Serverless Functions 部署后端

**选项B：Render/Railway部署后端**
- 注册 [Render](https://render.com) 或 [Railway](https://railway.app)
- 部署后端代码
- 前端修改 API 地址为生产地址

**选项C：前后端一起部署到VPS**
- 购买云服务器（阿里云/腾讯云/AWS等）
- 部署完整应用

---

## 方案二：Netlify 部署（免费）

1. 注册 [Netlify](https://netlify.com)
2. 连接 GitHub 仓库
3. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 点击 Deploy

---

## 方案三：云服务器部署（VPS）

### 购买服务器

推荐：
- 阿里云 ECS（入门配置即可）
- 腾讯云 CVM
- AWS Lightsail
- DigitalOcean Droplet

配置建议：1核2G，CentOS/Ubuntu系统

### 部署步骤

```bash
# 1. 连接服务器
ssh root@你的服务器IP

# 2. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装PM2（进程管理器）
sudo npm install -g pm2

# 4. 上传代码到服务器
# 本地执行：
scp -r . root@你的服务器IP:/var/www/destinymap

# 5. 服务器上安装依赖并构建
cd /var/www/destinymap
npm install
npm run build

# 6. 启动后端服务
pm2 start api/server.ts --name destinymap-api

# 7. 安装Nginx
sudo apt-get install nginx

# 8. 配置Nginx
sudo nano /etc/nginx/sites-available/destinymap
```

Nginx配置：
```nginx
server {
    listen 80;
    server_name 你的域名.com;

    # 前端静态文件
    location / {
        root /var/www/destinymap/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/destinymap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 配置SSL（HTTPS）
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名.com
```

---

## 方案四：Docker部署

### 创建 Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/data ./data

EXPOSE 3001

CMD ["node", "api/server.ts"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t destinymap .

# 运行容器
docker run -d -p 80:3001 --name destinymap destinymap
```

---

## 域名配置

### 购买域名

推荐：
- 阿里云域名（国内）
- Namecheap（海外）
- Cloudflare（海外）

### DNS解析

1. 添加A记录：
   - 主机记录：@（根域名）或 www
   - 记录值：你的服务器IP

2. 等待DNS生效（通常10分钟-48小时）

---

## 环境变量配置

创建 `.env` 文件：

```env
# 后端端口
PORT=3001

# 数据库
DATABASE_URL=./data/destinymap.db

# JWT密钥
JWT_SECRET=your-secret-key-here

# AI API密钥（如需接入真实AI）
OPENAI_API_KEY=sk-xxx
DEEPSEEK_API_KEY=sk-xxx

# 支付密钥（生产环境）
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
```

---

## 生产环境检查清单

- [ ] 修改前端API地址为生产地址
- [ ] 配置HTTPS（SSL证书）
- [ ] 设置环境变量
- [ ] 配置数据库持久化
- [ ] 设置自动备份
- [ ] 配置监控和日志
- [ ] 设置防火墙规则
- [ ] 配置CDN加速（可选）

---

## 推荐部署架构

```
用户 -> Cloudflare CDN -> Nginx (SSL) -> 前端静态文件
                                    -> API请求 -> Node.js后端 -> SQLite数据库
```

---

## 费用预估

| 方案 | 月费用 | 适合阶段 |
|------|--------|----------|
| Vercel + Render | 免费 | 冷启动/测试 |
| 阿里云ECS 1核2G | ~30元 | 小规模运营 |
| 阿里云ECS 2核4G | ~100元 | 中等规模 |
| AWS/DigitalOcean | $5-20 | 海外用户 |

---

## 快速启动（最简单方式）

1. 代码推送到GitHub
2. 用Vercel部署前端（自动）
3. 用Render部署后端（免费）
4. 购买域名并解析
5. 配置HTTPS
6. 上线完成！
