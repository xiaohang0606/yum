/**
 * 主题切换按钮组件 - 主入口文件
 *
 * 模块说明：
 * - config.js: 样式常量和位置配置
 * - dom-utils.js: DOM 查询和元素操作工具
 * - animations.js: 云朵漂浮动画
 * - theme-toggle.js: 主题切换核心逻辑
 * - event-handlers.js: 交互事件处理
 * - templates.js: HTML 和 CSS 模板
 * - theme-button.js: Web Component 定义
 */

import { registerThemeButton, ThemeButton, initThemeButton } from './modules/theme-button.js';

// 导出供外部使用
export { ThemeButton, initThemeButton };
export * from './modules/config.js';
export * from './modules/dom-utils.js';
export * from './modules/animations.js';
export * from './modules/theme-toggle.js';
export * from './modules/event-handlers.js';
export * from './modules/templates.js';

// 自动注册组件
registerThemeButton();
