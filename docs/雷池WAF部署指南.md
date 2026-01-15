# 🛡️ 雷池 WAF (SafeLine) Ubuntu 云服务器部署指南

## 📋 一、环境要求

在开始之前，请确保你的服务器满足以下条件：

| 项目 | 最低要求 |
|------|---------|
| 操作系统 | Ubuntu 18.04+ (推荐 20.04/22.04) |
| CPU 架构 | x86_64 (需支持 SSSE3 指令集) 或 arm64 |
| CPU | 1 核+ |
| 内存 | 1 GB+ |
| 磁盘空间 | 5 GB+ |
| Docker | 20.10.14+ |
| Docker Compose | 2.0.0+ |

---

## 📌 二、检查系统环境

SSH 登录到你的云服务器后，执行以下检查：

```bash
# 1. 检查 CPU 架构
uname -m
# 应输出: x86_64 或 aarch64

# 2. 检查是否支持 SSSE3 指令集 (x86_64 架构需要)
lscpu | grep ssse3
# 应该有输出，如果没有说明不支持

# 3. 检查系统版本
lsb_release -a
```

---

## 🐳 三、安装 Docker 和 Docker Compose

### 3.1 卸载旧版本 Docker (如有)

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

### 3.2 更新系统并安装依赖

```bash
# 更新软件包索引
sudo apt-get update

# 安装必要的依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### 3.3 添加 Docker 官方 GPG 密钥

```bash
# 创建 keyrings 目录
sudo mkdir -p /etc/apt/keyrings

# 下载并添加 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

### 3.4 设置 Docker 仓库

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 3.5 安装 Docker Engine

```bash
# 更新软件包索引
sudo apt-get update

# 安装 Docker
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 3.6 验证 Docker 安装

```bash
# 检查 Docker 版本
docker version

# 检查 Docker Compose 版本
docker compose version

# 运行测试容器
sudo docker run hello-world
```

### 3.7 配置 Docker 权限 (可选)

```bash
# 将当前用户添加到 docker 组，避免每次使用 sudo
sudo usermod -aG docker $USER

# 重新登录或执行以下命令使更改生效
newgrp docker
```

---

## 🚀 四、安装雷池 WAF

雷池提供两种安装方式，推荐使用**在线安装**。

### 方式一：在线一键安装（推荐）

```bash
# 使用官方安装脚本
bash -c "$(curl -fsSLk https://waf-ce.chaitin.cn/release/latest/setup.sh)"
```

脚本会自动：
1. 检查系统环境
2. 创建安装目录 (默认 `/data/safeline`)
3. 下载 Docker 镜像
4. 启动雷池服务

#### 安装过程中的选项：

| 提示 | 说明 | 建议 |
|------|------|------|
| 安装目录 | 雷池安装位置 | 默认 `/data/safeline` 即可 |
| 是否使用国内镜像 | 加速下载 | 国内服务器选 `Y` |

### 方式二：离线安装

如果服务器无法访问外网，可以使用离线安装：

```bash
# 1. 在有网络的机器上下载离线包
wget https://waf-ce.chaitin.cn/release/latest/safeline-offline.tar.gz

# 2. 将离线包上传到服务器

# 3. 解压并安装
tar -xzf safeline-offline.tar.gz
cd safeline-offline
bash ./setup.sh
```

---

## ⚙️ 五、安装后配置

### 5.1 获取管理员登录信息

安装完成后，使用 CLI 工具重置/获取管理员密码：

```bash
# 进入安装目录
cd /data/safeline

# 重置 admin 密码（推荐方式）
sudo docker exec safeline-mgt /app/mgt-cli reset-admin
```

执行后会输出新的用户名和密码：

```
[INFO] Initial username：admin
[INFO] Initial password：xxxxxxxx
[INFO] Done
```

> 💡 **提示**：每次执行 `reset-admin` 都会生成新的随机密码，请及时保存

### 5.2 访问管理界面

打开浏览器访问：

```
https://你的服务器IP:9443
```

> ⚠️ **注意**：
> - 默认端口是 `9443`
> - 使用 HTTPS 协议
> - 首次访问会提示证书不安全，点击"继续"即可
> - 默认用户名：`admin`

---

## 🔥 六、配置云服务器安全组

**非常重要！** 需要在云服务商控制台开放以下端口：

| 端口 | 协议 | 用途 |
|------|------|------|
| 9443 | TCP | 雷池管理界面 |
| 80 | TCP | HTTP 流量 (WAF 防护) |
| 443 | TCP | HTTPS 流量 (WAF 防护) |

### 各云服务商配置位置：

- **阿里云**：ESC 实例 → 安全组 → 配置规则
- **腾讯云**：CVM → 安全组 → 入站规则
- **华为云**：ECS → 安全组 → 入方向规则

---

## 🌐 七、添加站点防护

登录管理界面后，按以下步骤添加网站：

### 7.1 添加站点

1. 点击 **「防护站点」** → **「添加站点」**
2. 填写配置：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| 域名 | 需要防护的域名 | `xm.yihang.shop` |
| 监听端口 | WAF 接收流量的端口 | `80` / `443` |
| 上游服务器 | 真实后端地址 | `http://127.0.0.1:8080` |

### 7.2 配置示例：xm.yihang.shop

假设你的后端服务运行在服务器的 `8080` 端口：

#### 步骤一：在雷池中添加站点

1. 登录雷池管理界面：`https://服务器IP:9443`
2. 进入 **「防护站点」** → **「添加站点」**
3. 填写：
   - **域名**：`xm.yihang.shop`
   - **监听端口**：`80`（如需 HTTPS 则添加 `443`）
   - **上游服务器**：`http://127.0.0.1:8080`（你的真实后端地址）
4. 点击 **「保存」**

#### 步骤二：配置 DNS 解析

在你的域名服务商（如腾讯云 DNSPod）配置：

| 主机记录 | 记录类型 | 记录值 |
|----------|----------|--------|
| xm | A | `你的雷池服务器IP` |

> 💡 DNS 解析生效需要几分钟到几小时不等

#### 步骤三：配置 HTTPS（可选但推荐）

1. 进入 **「证书管理」** → **「添加证书」**
2. 上传你的 SSL 证书（`.crt` 或 `.pem`）和私钥（`.key`）
3. 返回 **「防护站点」**，编辑站点
4. 添加监听端口 `443`，并选择刚上传的证书

### 7.3 工作原理图

```
用户访问 xm.yihang.shop
         ↓
    DNS 解析到雷池服务器IP
         ↓
    雷池WAF (检测/过滤恶意请求)
         ↓
    转发到后端服务器 127.0.0.1:8080
```

---

## 📊 八、常用管理命令

```bash
# 进入安装目录
cd /data/safeline

# 查看所有容器状态
sudo docker compose ps

# 查看日志
sudo docker compose logs -f

# 停止雷池
sudo docker compose down

# 启动雷池
sudo docker compose up -d

# 重启雷池
sudo docker compose restart

# 更新雷池版本
sudo bash -c "$(curl -fsSLk https://waf-ce.chaitin.cn/release/latest/upgrade.sh)"
```

---

## 🔧 九、高级配置（可选）

### 9.1 修改默认端口

编辑配置文件：

```bash
cd /data/safeline
sudo nano compose.yaml
```

找到管理界面端口配置，修改 `9443` 为你想要的端口。

### 9.2 配置 SSL 证书

1. 登录管理界面
2. 进入 **"证书管理"**
3. 上传你的 SSL 证书和私钥
4. 在站点配置中选择对应证书

### 9.3 开启防护规则

1. 进入 **"通用配置"** → **"防护配置"**
2. 推荐开启：
   - ✅ SQL 注入防护
   - ✅ XSS 防护
   - ✅ 命令注入防护
   - ✅ 路径遍历防护
   - ✅ 恶意爬虫识别

---

## 🚨 十、故障排查

### 问题1：无法访问管理界面

```bash
# 检查容器是否运行
cd /data/safeline
sudo docker compose ps

# 检查端口是否监听
sudo netstat -tlnp | grep 9443

# 检查防火墙
sudo ufw status
# 如果开启了，允许端口
sudo ufw allow 9443
```

### 问题2：网站无法访问

```bash
# 检查 WAF 日志
sudo docker compose logs safeline-tengine

# 检查上游服务器是否可达
curl -I http://你的后端地址
```

### 问题3：CPU/内存占用高

```bash
# 查看容器资源使用
sudo docker stats
```

---

## ✅ 十一、部署检查清单

- [ ] Docker 和 Docker Compose 已安装
- [ ] 雷池安装成功，容器正常运行
- [ ] 云服务器安全组已开放 9443、80、443 端口
- [ ] 可以访问管理界面 `https://IP:9443`
- [ ] 已添加需要防护的站点
- [ ] DNS 解析已指向雷池服务器
- [ ] 防护规则已配置

---

## 📚 参考资源

- **官方文档**：https://docs.waf-ce.chaitin.cn/
- **GitHub**：https://github.com/chaitin/SafeLine
- **社区**：https://github.com/chaitin/SafeLine/discussions

---

> 📅 文档生成时间：2026-01-14
