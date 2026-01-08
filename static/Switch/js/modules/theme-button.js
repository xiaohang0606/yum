/**
 * ThemeButton Web Component 模块
 * 定义自定义元素 <theme-button>
 */

import { createQuerySelector, getThemeElements } from './dom-utils.js';
import { createThemeState, onSystemThemeChange } from './theme-toggle.js';
import { bindEventListeners } from './event-handlers.js';
import { startCloudAnimation } from './animations.js';
import { COMPONENT_HTML, COMPONENT_STYLES } from './templates.js';

/**
 * 初始化主题按钮功能
 * @param {HTMLElement} root - 根容器元素
 * @param {string} initTheme - 初始主题 ('light' | 'dark')
 * @param {Function} changeTheme - 主题变更回调函数
 */
export const initThemeButton = (root, initTheme, changeTheme) => {
  const $ = createQuerySelector(root);
  const elements = getThemeElements($);
  const state = createThemeState();

  // 绑定事件监听器
  const { triggerClick } = bindEventListeners(elements, state, changeTheme);

  // 监听系统主题变化
  onSystemThemeChange((isDark) => {
    if (isDark && !state.isMoved) {
      triggerClick();
    } else if (!isDark && state.isMoved) {
      triggerClick();
    }
  });

  // 启动云朵动画
  startCloudAnimation(root);

  // 如果初始主题是深色，则切换到夜间模式
  if (initTheme === "dark") {
    triggerClick();
  }
};

/**
 * ThemeButton 自定义元素类
 */
export class ThemeButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // 获取属性
    const initTheme = this.getAttribute("value") || "light";
    const size = +this.getAttribute("size") || 3;

    // 创建 Shadow DOM
    const shadow = this.attachShadow({ mode: "closed" });

    // 创建容器
    const container = document.createElement("div");
    container.setAttribute("class", "container");
    container.setAttribute("style", `font-size: ${(size / 3).toFixed(2)}px`);
    container.innerHTML = COMPONENT_HTML;

    // 创建样式
    const style = document.createElement("style");
    style.textContent = COMPONENT_STYLES;

    // 主题变更回调
    const changeTheme = (detail) => {
      this.dispatchEvent(new CustomEvent("change", { detail }));
    };

    // 初始化功能
    initThemeButton(container, initTheme, changeTheme);

    // 添加到 Shadow DOM
    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}

/**
 * 注册自定义元素
 */
export const registerThemeButton = () => {
  if (!customElements.get('theme-button')) {
    customElements.define("theme-button", ThemeButton);
  }
};
