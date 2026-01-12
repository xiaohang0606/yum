# Ubuntu 部署与启动修复指南

如果你在 Ubuntu 上运行 BettaFish 遇到 `Connection refused` 或子进程启动失败，请按照以下步骤进行排查和修复。

## 1. 安装系统依赖 (关键)

Streamlit 和浏览器自动化工具 (Playwright) 在 Linux 上需要一些基础图形库。请运行以下命令：

```bash
# 更新软件包列表
sudo apt-get update

# 安装 Streamlit 和 Playwright 常用的系统库
sudo apt-get install -y libgl1 libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2
```

## 2. 安装 Playwright 浏览器依赖

即使安装了上面的系统库，Playwright 内部也需要特定的内核支持：

```bash
# 在你的 python 虚拟环境中执行
playwright install-deps chromium
playwright install chromium
```

## 3. 检查端口占用与防火墙 (解决 502 错误)

如果你在浏览器看到 `502 Bad Gateway`，通常是因为前端无法连接到引擎端口。

### 3.1 开放云服务器防火墙
确保在**腾讯云控制台的“安全组”**中开放了以下入站规则：
- **TCP: 5000** (主应用)
- **TCP: 8501, 8502, 8503** (三个分析引擎)

### 3.2 检查进程与端口
确保 8501, 8502, 8503 端口没有被之前的残留进程占用：

```bash
# 查看并杀掉占用端口的 Python 进程
lsof -i :8501,8502,8503
# 如果有输出，使用 kill -9 <PID> 结束进程
```

## 4. 验证服务器资源

如果你的服务器内存小于 2GB，可能会导致 `query` 引擎因为内存不足启动失败。
通过 `free -m` 查看当前可用内存。如果不足，可以尝试：
- 增加 Swap 交换分区。
- 逐个启动引擎，而不是同时全部启动。

## 5. 常见报错及解决

- **ImportError: libGL.so.1: cannot open shared object file**: 运行 `sudo apt-get install libgl1`。
- **ModuleNotFoundError**: 确保你已在虚拟环境中运行过 `pip install -r requirements.txt`。
- **Permission Denied**: 确保当前用户对 `logs/` 目录有写入权限。
