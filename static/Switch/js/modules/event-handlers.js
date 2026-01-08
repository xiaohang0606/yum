/**
 * 事件处理模块
 * 处理点击、鼠标悬停等交互事件
 */

import {
  HOVER_DAY_POSITIONS,
  HOVER_NIGHT_POSITIONS,
  DEFAULT_STAR_POSITIONS,
  DEFAULT_CLOUD_POSITIONS,
  NIGHT_STYLES,
  DAY_STYLES
} from './config.js';
import { setPositions } from './dom-utils.js';
import { applyDayStyles, applyNightStyles } from './theme-toggle.js';

/**
 * 创建点击处理函数
 * @param {Object} elements - DOM 元素对象
 * @param {Object} state - 主题状态对象
 * @param {Function} changeTheme - 主题变更回调
 * @returns {Function} 点击处理函数
 */
export const createClickHandler = (elements, state, changeTheme) => {
  return () => {
    if (state.isMoved) {
      // 切换到日间模式
      applyDayStyles(elements);
      changeTheme("light");
    } else {
      // 切换到夜间模式
      applyNightStyles(elements);
      changeTheme("dark");
    }

    state.setClicked(true);
    state.toggle();
  };
};

/**
 * 创建鼠标移入处理函数
 * @param {Object} elements - DOM 元素对象
 * @param {Object} state - 主题状态对象
 * @returns {Function} 鼠标移入处理函数
 */
export const createMouseMoveHandler = (elements, state) => {
  const { mainButton, daytimeBackground, star, cloudList } = elements;

  return () => {
    if (state.isClicked) return;

    if (state.isMoved) {
      // 夜间模式下的悬停效果
      mainButton.style.transform = HOVER_NIGHT_POSITIONS.button.transform;

      HOVER_NIGHT_POSITIONS.background.transforms.forEach((transform, index) => {
        daytimeBackground[index].style.transform = transform;
      });

      // 星星位置变化
      setPositions(star, HOVER_NIGHT_POSITIONS.stars);
    } else {
      // 日间模式下的悬停效果
      mainButton.style.transform = HOVER_DAY_POSITIONS.button.transform;

      HOVER_DAY_POSITIONS.background.transforms.forEach((transform, index) => {
        daytimeBackground[index].style.transform = transform;
      });

      // 云朵位置变化
      setPositions(cloudList, HOVER_DAY_POSITIONS.clouds);
    }
  };
};

/**
 * 创建鼠标移出处理函数
 * @param {Object} elements - DOM 元素对象
 * @param {Object} state - 主题状态对象
 * @returns {Function} 鼠标移出处理函数
 */
export const createMouseOutHandler = (elements, state) => {
  const { mainButton, daytimeBackground, star, cloudList } = elements;

  return () => {
    if (state.isClicked) return;

    if (state.isMoved) {
      // 夜间模式下恢复默认位置
      mainButton.style.transform = NIGHT_STYLES.button.transform;

      NIGHT_STYLES.background.transforms.forEach((transform, index) => {
        daytimeBackground[index].style.transform = transform;
      });

      // 星星恢复默认位置
      setPositions(star, DEFAULT_STAR_POSITIONS);
    } else {
      // 日间模式下恢复默认位置
      mainButton.style.transform = DAY_STYLES.button.transform;

      DAY_STYLES.background.transforms.forEach((transform, index) => {
        daytimeBackground[index].style.transform = transform;
      });

      // 云朵恢复默认位置
      setPositions(cloudList, DEFAULT_CLOUD_POSITIONS);
    }
  };
};

/**
 * 绑定所有事件监听器
 * @param {Object} elements - DOM 元素对象
 * @param {Object} state - 主题状态对象
 * @param {Function} changeTheme - 主题变更回调
 * @returns {Object} 包含事件处理函数的对象
 */
export const bindEventListeners = (elements, state, changeTheme) => {
  const { mainButton, components } = elements;

  const clickHandler = createClickHandler(elements, state, changeTheme);
  const mouseMoveHandler = createMouseMoveHandler(elements, state);
  const mouseOutHandler = createMouseOutHandler(elements, state);

  // 绑定事件
  components.onclick = clickHandler;
  mainButton.addEventListener("mousemove", mouseMoveHandler);
  mainButton.addEventListener("mouseout", mouseOutHandler);

  return {
    clickHandler,
    mouseMoveHandler,
    mouseOutHandler,
    // 触发点击（用于程序化切换）
    triggerClick: clickHandler
  };
};
