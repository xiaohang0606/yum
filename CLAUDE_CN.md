# CLAUDE_CN.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 语言规范

与用户对话时使用中文。代码注释和文档保持与现有代码风格一致。

## 项目概述

BettaFish (微舆) 是一个多智能体舆情分析系统,通过协调多个专业化 AI 智能体来分析社交媒体内容、生成报告并提供情感洞察。系统使用 Flask 后端协调多个 Streamlit 应用程序,并采用基于论坛的智能体协作机制。

## 常用命令

### 启动系统

```bash
# 完整系统 (Flask + 所有智能体)
python app.py

# 单独启动智能体
streamlit run SingleEngineApp/query_engine_streamlit_app.py --server.port 8503
streamlit run SingleEngineApp/media_engine_streamlit_app.py --server.port 8502
streamlit run SingleEngineApp/insight_engine_streamlit_app.py --server.port 8501
```

### 报告生成命令行

```bash
# 从最新引擎输出生成报告
python report_engine_only.py

# 指定主题
python report_engine_only.py --query "土木工程行业分析"

# 跳过 PDF/Markdown 生成
python report_engine_only.py --skip-pdf --skip-markdown

# 启用 GraphRAG
python report_engine_only.py --graphrag-enabled true --graphrag-max-queries 3
```

### 重新生成报告

```bash
python regenerate_latest_html.py  # 从最新章节重建 HTML
python regenerate_latest_md.py    # 重建 Markdown
python regenerate_latest_pdf.py   # 重建带 SVG 图表的 PDF
```

### 爬虫系统 (MindSpider)

```bash
cd MindSpider
python main.py --setup                              # 初始化
python main.py --broad-topic                        # 提取话题
python main.py --complete --date 2024-01-20         # 完整爬取
python main.py --deep-sentiment --platforms xhs dy wb  # 指定平台
```

### 运行测试

```bash
# 使用 pytest
pytest tests/test_monitor.py -v
pytest tests/test_report_engine_sanitization.py -v

# 直接执行
python tests/run_tests.py
```

### 依赖安装

```bash
pip install -r requirements.txt
playwright install chromium  # 爬虫所需浏览器驱动
```

## 系统架构

### 核心智能体 (引擎)

每个智能体遵循一致的结构: `agent.py` (主逻辑), `llms/` (LLM 客户端), `nodes/` (处理节点), `tools/` (工具集), `prompts/` (提示词模板), `state/` (状态管理)。

- **QueryEngine (查询引擎)**: 网络搜索智能体,用于国内外新闻搜索。使用 Tavily、Bocha 或 Anspire API。
- **MediaEngine (媒体引擎)**: 多模态内容分析,用于视频/图片平台 (抖音、快手)。
- **InsightEngine (洞察引擎)**: 私有数据库挖掘智能体。查询 PostgreSQL/MySQL 中存储的情感数据。
- **ReportEngine (报告引擎)**: 多轮报告生成。输出为 IR (中间表示),然后渲染为 HTML/PDF/Markdown。
- **ForumEngine (论坛引擎)**: 智能体协作编排器。使用 LLM "主持人" 调节智能体讨论。

### 智能体协作流程

1. 用户通过 Flask (`app.py`) 提交查询
2. 三个分析智能体 (Query, Media, Insight) 作为 Streamlit 应用并行运行
3. ForumEngine 监控智能体日志,生成主持人指导
4. 智能体通过 `utils/forum_reader.py` 读取论坛讨论
5. ReportEngine 收集输出,选择模板,生成 IR,渲染最终报告

### 关键文件

- `config.py`: 从 `.env` 加载 Pydantic 配置
- `app.py`: Flask 主入口,管理 Streamlit 子进程和 WebSocket 事件
- `ReportEngine/agent.py`: 报告编排 (模板选择 → 布局 → 章节 → 渲染)
- `ReportEngine/ir/schema.py`: 报告 IR 块/标记模式定义
- `ReportEngine/renderers/html_renderer.py`: IR 到 HTML 转换
- `ForumEngine/monitor.py`: 日志监控和论坛管理

### 前端结构

- `templates/index.html`: 主 HTML 结构 (160 行)
- `static/js/main.js`: 核心前端逻辑 - Socket.IO、引擎状态、控制台输出、报告流式传输 (~5000 行)
- `static/js/pdf-font-data.js`: PDF 导出中文字体数据 (GB2312 子集, ~5MB)
- `static/styles.css`: 基础样式
- `static/modern-theme.css`: 主题样式

### 主题切换组件

位于 `static/Switch/`,一个日/夜主题切换 Web 组件。

**文件结构:**
```
static/Switch/
├── index.html              # 原始版本入口
├── index-modules.html      # 模块化版本入口
├── js/
│   ├── script.js           # 原始单文件版本(向后兼容)
│   ├── index.js            # 模块化主入口
│   └── modules/
│       ├── config.js       # 样式常量、位置配置、动画参数
│       ├── dom-utils.js    # DOM 查询器、批量样式操作
│       ├── animations.js   # 云朵随机漂浮动画
│       ├── theme-toggle.js # 主题状态管理、系统主题检测
│       ├── event-handlers.js # 点击/悬停/移出事件处理
│       ├── templates.js    # HTML 结构和 CSS 样式模板
│       └── theme-button.js # <theme-button> Web Component 定义
└── LICENSE
```

**使用方法:**
```html
<!-- 原始方式 -->
<script src="js/script.js"></script>

<!-- 模块化方式 -->
<script type="module" src="js/index.js"></script>

<!-- 组件使用 -->
<theme-button value="dark" size="3"></theme-button>
```

**属性:**
- `value`: 初始主题 (`light` | `dark`)
- `size`: 组件缩放因子 (默认: 3)

**事件:**
- `change`: 主题改变时触发,`event.detail` 为 `'light'` 或 `'dark'`

### 配置说明

所有配置在 `.env` 文件中 (从 `.env.example` 复制)。主要配置项:

- **数据库**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_DIALECT` (postgresql/mysql)
- **各智能体 LLM**: `{AGENT}_API_KEY`, `{AGENT}_BASE_URL`, `{AGENT}_MODEL_NAME`,其中 AGENT 为 INSIGHT_ENGINE, MEDIA_ENGINE, QUERY_ENGINE, REPORT_ENGINE, FORUM_HOST, KEYWORD_OPTIMIZER
- **搜索工具**: `SEARCH_TOOL_TYPE` (AnspireAPI/BochaAPI), `TAVILY_API_KEY`, `ANSPIRE_API_KEY`, `BOCHA_WEB_SEARCH_API_KEY`
- **GraphRAG**: `GRAPHRAG_ENABLED`, `GRAPHRAG_MAX_QUERIES`

所有 LLM 调用使用 OpenAI 兼容 API 格式。

### 报告生成流程

1. **模板选择**: `ReportEngine/nodes/template_selection_node.py` 扫描 `report_template/` 目录
2. **文档布局**: `document_layout_node.py` 设计标题/目录结构
3. **字数预算**: `word_budget_node.py` 分配章节长度
4. **章节生成**: `chapter_generation_node.py` 为每章生成 JSON 块
5. **IR 验证**: `ReportEngine/ir/validator.py` 检查块结构
6. **拼接**: `ReportEngine/core/stitcher.py` 组装文档 IR
7. **渲染**: `renderers/html_renderer.py` 或 `pdf_renderer.py`

### 输出目录

- `logs/`: 各智能体运行日志 (`insight.log`, `media.log`, `query.log`, `forum.log`)
- `final_reports/`: 生成的 HTML 报告
- `final_reports/ir/`: 报告 IR JSON 文件
- `final_reports/pdf/`: PDF 导出
- `final_reports/md/`: Markdown 导出
- `{engine}_streamlit_reports/`: 各引擎单独的 markdown 输出

### 端口分配

- Flask 主服务: 5000
- InsightEngine: 8501
- MediaEngine: 8502
- QueryEngine: 8503

## 情感分析模型

位于 `SentimentAnalysisModel/`:
- `WeiboMultilingualSentiment/`: 多语言分析
- `WeiboSentiment_Finetuned/BertChinese-Lora/`: BERT 中文 LoRA
- `WeiboSentiment_Finetuned/GPT2-Lora/`: GPT-2 LoRA
- `WeiboSentiment_SmallQwen/`: 小型 Qwen3 模型
- `WeiboSentiment_MachineLearning/`: 传统机器学习 (SVM 等)

## 测试

测试文件位于 `tests/` 目录:
- `test_monitor.py`: ForumEngine 日志解析测试
- `test_report_engine_sanitization.py`: ReportEngine 安全性测试
- `forum_log_test_data.py`: 日志格式解析测试数据

## 故障排查

### 连接错误

**症状:** 日志中出现 `Connection error` 并伴随重试:
```
ERROR | ReportEngine.llms.base:stream_invoke:140 - 流式请求失败: Connection error.
WARNING | retry_helper:wrapper:97 - 函数 stream_invoke_to_string 第 1 次尝试失败
```

**常见原因:**
1. **无效的 BASE_URL**: 检查 `.env` 中的 `{AGENT}_BASE_URL` (OpenAI 兼容 API 必须包含 `/v1` 后缀)
2. **网络问题**: 验证防火墙/代理设置,使用 `curl {BASE_URL}/models` 测试
3. **无效的 API 密钥**: 确认 `{AGENT}_API_KEY` 正确且有效
4. **速率限制**: API 提供商可能正在限流

**重试机制:**
- 位于 `utils/retry_helper.py`
- 默认: 3 次尝试,60 秒指数退避
- 应用于 `{Engine}/llms/base.py` 中的所有 LLM 调用

**快速修复:**
```bash
# 测试 API 连接
curl -H "Authorization: Bearer $REPORT_ENGINE_API_KEY" \
     $REPORT_ENGINE_BASE_URL/models

# 检查 .env 配置
grep "_BASE_URL" .env
grep "_API_KEY" .env
```