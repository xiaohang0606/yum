/**
 * 主题切换模块
 * 处理日间/夜间模式的样式切换
 */

import {
  DAY_STYLES,
  NIGHT_STYLES,
  ANIMATION_CONFIG
} from './config.js';
import { setStyles } from './dom-utils.js';

/**
 * 应用日间模式样式
 * @param {Object} elements - DOM 元素对象
 */
export const applyDayStyles = (elements) => {
  const { mainButton, daytimeBackground, cloud, cloudLight, components, moon, stars } = elements;

  // 主按钮样式
  setStyles(mainButton, DAY_STYLES.button);

  // 背景层变换
  DAY_STYLES.background.transforms.forEach((transform, index) => {
    daytimeBackground[index].style.transform = transform;
  });

  // 云朵位置
  cloud.style.transform = DAY_STYLES.cloud.transform;
  cloudLight.style.transform = DAY_STYLES.cloud.transform;

  // 容器背景色
  components.style.backgroundColor = DAY_STYLES.container.backgroundColor;

  // 月亮透明度
  [0, 1, 2].forEach(index => {
    moon[index].style.opacity = DAY_STYLES.moon.opacity;
  });

  // 星星位置和透明度
  setStyles(stars, DAY_STYLES.stars);
};

/**
 * 应用夜间模式样式
 * @param {Object} elements - DOM 元素对象
 */
export const applyNightStyles = (elements) => {
  const { mainButton, daytimeBackground, cloud, cloudLight, components, moon, stars } = elements;

  // 主按钮样式
  setStyles(mainButton, NIGHT_STYLES.button);

  // 背景层变换
  NIGHT_STYLES.background.transforms.forEach((transform, index) => {
    daytimeBackground[index].style.transform = transform;
  });

  // 云朵位置
  cloud.style.transform = NIGHT_STYLES.cloud.transform;
  cloudLight.style.transform = NIGHT_STYLES.cloud.transform;

  // 容器背景色
  components.style.backgroundColor = NIGHT_STYLES.container.backgroundColor;

  // 月亮透明度
  [0, 1, 2].forEach(index => {
    moon[index].style.opacity = NIGHT_STYLES.moon.opacity;
  });

  // 星星位置和透明度
  setStyles(stars, NIGHT_STYLES.stars);
};

/**
 * 创建主题切换状态管理器
 * @returns {Object} 状态管理对象
 */
export const createThemeState = () => {
  let isMoved = false;  // 是否已切换到夜间模式
  let isClicked = false;  // 是否正在点击中（防止快速重复点击）

  return {
    get isMoved() { return isMoved; },
    get isClicked() { return isClicked; },

    toggle() {
      isMoved = !isMoved;
    },

    setClicked(value) {
      isClicked = value;
      if (value) {
        // 设置点击冷却
        setTimeout(() => {
          isClicked = false;
        }, ANIMATION_CONFIG.clickCooldown);
      }
    },

    isDarkMode() {
      return isMoved;
    }
  };
};

/**
 * 检测系统是否为深色模式
 * @returns {boolean} 是否为深色模式
 */
export const isSystemDarkMode = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * 监听系统主题变化
 * @param {Function} callback - 主题变化时的回调函数
 * @returns {Function} 取消监听的函数
 */
export const onSystemThemeChange = (callback) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => callback(mediaQuery.matches);
  mediaQuery.addEventListener("change", handler);

  return () => mediaQuery.removeEventListener("change", handler);
};
