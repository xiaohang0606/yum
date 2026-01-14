"""
Streamlit Web界面
为Media Agent提供友好的Web界面
"""

import os
import sys
import streamlit as st
from datetime import datetime
import json
import locale
from loguru import logger

# 设置UTF-8编码环境
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ['PYTHONUTF8'] = '1'

# 设置系统编码
try:
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
except locale.Error:
    try:
        locale.setlocale(locale.LC_ALL, 'C.UTF-8')
    except locale.Error:
        pass

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from MediaEngine import DeepSearchAgent, AnspireSearchAgent, Settings
from config import settings
from utils.github_issues import error_with_issue_link
import glob


def main():
    """主函数"""
    st.set_page_config(
        page_title="Media Agent",
        page_icon="",
        layout="wide"
    )

    st.title("Media Agent")
    st.markdown("具备强大多模态能力的AI代理")
    st.markdown("突破传统文本交流限制，广泛的浏览抖音、快手、小红书的视频、图文、直播")
    st.markdown("使用现代化搜索引擎提供的诸如日历卡、天气卡、股票卡等多模态结构化信息进一步增强能力")

    # 检查URL参数
    try:
        # 尝试使用新版本的query_params
        query_params = st.query_params
        auto_query = query_params.get('query', '')
        auto_search = query_params.get('auto_search', 'false').lower() == 'true'
    except AttributeError:
        # 兼容旧版本
        query_params = st.experimental_get_query_params()
        auto_query = query_params.get('query', [''])[0]
        auto_search = query_params.get('auto_search', ['false'])[0].lower() == 'true'

    # ----- 配置被硬编码 -----
    # 强制使用 Gemini
    model_name = settings.MEDIA_ENGINE_MODEL_NAME or "gemini-2.5-pro"
    # 默认高级配置
    max_reflections = 2
    max_content_length = 20000

    # 简化的研究查询展示区域

    # 如果有自动查询，使用它作为默认值，否则显示占位符
    display_query = auto_query if auto_query else "等待从主页面接收分析内容..."

    # 只读的查询展示区域
    st.text_area(
        "当前查询",
        value=display_query,
        height=100,
        disabled=True,
        help="查询内容由主页面的搜索框控制",
        label_visibility="hidden"
    )

    # 自动搜索逻辑
    start_research = False
    query = auto_query

    if auto_search and auto_query and 'auto_search_executed' not in st.session_state:
        st.session_state.auto_search_executed = True
        start_research = True
    elif auto_query and not auto_search:
        st.warning("等待搜索启动信号...")

    # 验证配置
    if start_research:
        if not query.strip():
            st.error("请输入研究查询")
            logger.error("请输入研究查询")
            return

        # 由于强制使用Gemini，检查相关的API密钥
        if not settings.MEDIA_ENGINE_API_KEY:
            st.error("请在您的环境变量中设置MEDIA_ENGINE_API_KEY")
            logger.error("请在您的环境变量中设置MEDIA_ENGINE_API_KEY")
            return

        # 自动使用配置文件中的API密钥
        engine_key = settings.MEDIA_ENGINE_API_KEY
        bocha_key = settings.BOCHA_WEB_SEARCH_API_KEY
        ansire_key = settings.ANSPIRE_API_KEY

        # 构建 Settings（pydantic_settings风格，优先大写环境变量）
        if settings.SEARCH_TOOL_TYPE == "BochaAPI":
            if not bocha_key:
                st.error("请在您的环境变量中设置BOCHA_WEB_SEARCH_API_KEY")
                logger.error("请在您的环境变量中设置BOCHA_WEB_SEARCH_API_KEY")
                return
            logger.info("使用Bocha搜索API密钥")
            config = Settings(
                MEDIA_ENGINE_API_KEY=engine_key,
                MEDIA_ENGINE_BASE_URL=settings.MEDIA_ENGINE_BASE_URL,
                MEDIA_ENGINE_MODEL_NAME=model_name,
                SEARCH_TOOL_TYPE="BochaAPI",
                BOCHA_WEB_SEARCH_API_KEY=bocha_key,
                MAX_REFLECTIONS=max_reflections,
                SEARCH_CONTENT_MAX_LENGTH=max_content_length,
                OUTPUT_DIR="media_engine_streamlit_reports",
            )
        elif settings.SEARCH_TOOL_TYPE == "AnspireAPI":
            if not ansire_key:
                st.error("请在您的环境变量中设置ANSPIRE_API_KEY")
                logger.error("请在您的环境变量中设置ANSPIRE_API_KEY")
                return
            logger.info("使用Anspire搜索API密钥")
            config = Settings(
                MEDIA_ENGINE_API_KEY=engine_key,
                MEDIA_ENGINE_BASE_URL=settings.MEDIA_ENGINE_BASE_URL,
                MEDIA_ENGINE_MODEL_NAME=model_name,
                SEARCH_TOOL_TYPE="AnspireAPI",
                ANSPIRE_API_KEY=ansire_key,
                MAX_REFLECTIONS=max_reflections,
                SEARCH_CONTENT_MAX_LENGTH=max_content_length,
                OUTPUT_DIR="media_engine_streamlit_reports",
            )
        else:
            st.error(f"未知的搜索工具类型: {settings.SEARCH_TOOL_TYPE}")
            logger.error(f"未知的搜索工具类型: {settings.SEARCH_TOOL_TYPE}")
            return

        # 执行研究
        execute_research(query, config)
    
    # 如果已有研究结果，重新显示（防止页面刷新后丢失）
    elif st.session_state.get('research_completed') and st.session_state.get('final_report'):
        st.success("研究已完成！")
        
        # 添加重置按钮
        col1, col2 = st.columns([3, 1])
        with col2:
            if st.button("🔄 开始新研究", key="reset_btn", type="primary"):
                # 清空关键的 session state
                keys_to_clear = ['research_completed', 'final_report', 'agent', 
                                'auto_search_executed', 'history_report_content']
                for key in keys_to_clear:
                    if key in st.session_state:
                        del st.session_state[key]
                st.rerun()
        
        st.header("研究结果")
        st.markdown(st.session_state.final_report)
        
        # 显示 agent 详情（如果存在）
        if st.session_state.get('agent'):
            agent = st.session_state.agent
            with st.expander("查看详细信息"):
                for i, paragraph in enumerate(agent.state.paragraphs):
                    st.write(f"**段落 {i + 1}: {paragraph.title}**")
                    summary = paragraph.research.latest_summary
                    st.write(summary[:500] + "..." if len(summary) > 500 else summary)
                    st.divider()
    
    # 历史报告加载功能
    load_history_reports("media_engine_streamlit_reports")


def load_history_reports(reports_dir: str):
    """加载并显示历史报告"""
    st.divider()
    
    # 获取报告文件列表
    report_pattern = os.path.join(reports_dir, "deep_search_report_*.md")
    report_files = sorted(glob.glob(report_pattern), key=os.path.getmtime, reverse=True)
    
    if not report_files:
        with st.expander("📂 历史报告（暂无）"):
            st.info("暂无历史报告。完成研究后，报告将自动保存在此。")
        return
    
    with st.expander(f"📂 历史报告（{len(report_files)} 份）"):
        # 创建选择器
        report_names = []
        for f in report_files[:10]:  # 最多显示10份
            basename = os.path.basename(f)
            mtime = datetime.fromtimestamp(os.path.getmtime(f))
            report_names.append(f"{basename} ({mtime.strftime('%m-%d %H:%M')})")
        
        selected = st.selectbox(
            "选择要查看的报告",
            options=range(len(report_names)),
            format_func=lambda x: report_names[x],
            key="history_report_selector"
        )
        
        if st.button("📖 加载报告", key="load_history_btn"):
            try:
                with open(report_files[selected], 'r', encoding='utf-8') as f:
                    content = f.read()
                st.session_state.history_report_content = content
            except Exception as e:
                st.error(f"读取报告失败: {e}")
        
        # 显示已加载的历史报告
        if st.session_state.get('history_report_content'):
            st.markdown("---")
            st.markdown(st.session_state.history_report_content)


def execute_research(query: str, config: Settings):
    """执行研究"""
    try:
        # 创建进度条
        progress_bar = st.progress(0)
        status_text = st.empty()

        # 初始化Agent
        status_text.text("正在初始化Agent...")
        if config.SEARCH_TOOL_TYPE == "BochaAPI":
            agent = DeepSearchAgent(config)
        elif config.SEARCH_TOOL_TYPE == "AnspireAPI":
            agent = AnspireSearchAgent(config)
        else:
            raise ValueError(f"未知的搜索工具类型: {config.SEARCH_TOOL_TYPE}")
        st.session_state.agent = agent

        progress_bar.progress(10)

        # 生成报告结构
        status_text.text("正在生成报告结构...")
        agent._generate_report_structure(query)
        progress_bar.progress(20)

        # 处理段落
        total_paragraphs = len(agent.state.paragraphs)
        for i in range(total_paragraphs):
            status_text.text(f"正在处理段落 {i + 1}/{total_paragraphs}: {agent.state.paragraphs[i].title}")

            # 初始搜索和总结
            agent._initial_search_and_summary(i)
            progress_value = 20 + (i + 0.5) / total_paragraphs * 60
            progress_bar.progress(int(progress_value))

            # 反思循环
            agent._reflection_loop(i)
            agent.state.paragraphs[i].research.mark_completed()

            progress_value = 20 + (i + 1) / total_paragraphs * 60
            progress_bar.progress(int(progress_value))

        # 生成最终报告
        status_text.text("正在生成最终报告...")
        logger.info("正在生成最终报告...")
        final_report = agent._generate_final_report()
        progress_bar.progress(90)

        # 保存报告
        status_text.text("正在保存报告...")
        logger.info("正在保存报告...")
        agent._save_report(final_report)
        progress_bar.progress(100)

        status_text.text("研究完成！")
        logger.info("研究完成！")
        
        # 保存结果到 session state，防止页面刷新后丢失
        st.session_state.final_report = final_report
        st.session_state.research_completed = True
        
        # 显示结果
        display_results(agent, final_report)

    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        error_display = error_with_issue_link(
            f"研究过程中发生错误: {str(e)}",
            error_traceback,
            app_name="Media Engine Streamlit App"
        )
        st.error(error_display)
        logger.exception(f"研究过程中发生错误: {str(e)}")


def display_results(agent: DeepSearchAgent, final_report: str):
    """显示研究结果"""
    st.header("研究结果")

    # 结果标签页（已移除下载选项）
    tab1, tab2 = st.tabs(["研究小结", "引用信息"])

    with tab1:
        st.markdown(final_report)

    with tab2:
        # 段落详情
        st.subheader("段落详情")
        for i, paragraph in enumerate(agent.state.paragraphs):
            with st.expander(f"段落 {i + 1}: {paragraph.title}"):
                st.write("**预期内容:**", paragraph.content)
                st.write("**最终内容:**", paragraph.research.latest_summary[:300] + "..."
                if len(paragraph.research.latest_summary) > 300
                else paragraph.research.latest_summary)
                st.write("**搜索次数:**", paragraph.research.get_search_count())
                st.write("**反思次数:**", paragraph.research.reflection_iteration)

        # 搜索历史
        st.subheader("搜索历史")
        all_searches = []
        for paragraph in agent.state.paragraphs:
            all_searches.extend(paragraph.research.search_history)

        if all_searches:
            for i, search in enumerate(all_searches):
                query_label = search.query if search.query else "未记录查询"
                with st.expander(f"搜索 {i + 1}: {query_label}"):
                    paragraph_title = getattr(search, "paragraph_title", "") or "未标注段落"
                    search_tool = getattr(search, "search_tool", "") or "未标注工具"
                    has_result = getattr(search, "has_result", True)
                    st.write("**段落:**", paragraph_title)
                    st.write("**使用的工具:**", search_tool)
                    preview = search.content or ""
                    if not isinstance(preview, str):
                        preview = str(preview)
                    if len(preview) > 200:
                        preview = preview[:200] + "..."
                    st.write("**URL:**", search.url or "无")
                    st.write("**标题:**", search.title or "无")
                    st.write("**内容预览:**", preview if preview else "无可用内容")
                    if not has_result:
                        st.info("本次搜索未返回结果")
                    if search.score:
                        st.write("**相关度评分:**", search.score)


if __name__ == "__main__":
    main()
