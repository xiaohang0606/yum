/**
 * 动画模块
 * 处理云朵随机移动等动画效果
 */

import { ANIMATION_CONFIG } from './config.js';

/**
 * 获取随机移动方向
 * @returns {string} 随机方向值
 */
export const getRandomDirection = () => {
  const { randomDirections } = ANIMATION_CONFIG;
  return randomDirections[Math.floor(Math.random() * randomDirections.length)];
};

/**
 * 随机移动单个元素
 * @param {HTMLElement} element - 要移动的元素
 */
export const moveElementRandomly = (element) => {
  const randomDirectionX = getRandomDirection();
  const randomDirectionY = getRandomDirection();
  element.style.transform = `translate(${randomDirectionX}, ${randomDirectionY})`;
};

/**
 * 启动云朵随机漂浮动画
 * @param {ShadowRoot|HTMLElement} root - 根元素
 * @returns {number} 定时器 ID，可用于清除动画
 */
export const startCloudAnimation = (root) => {
  const cloudSons = root.querySelectorAll(".cloud-son");
  const intervalId = setInterval(() => {
    cloudSons.forEach(moveElementRandomly);
  }, ANIMATION_CONFIG.cloudMoveInterval);

  return intervalId;
};

/**
 * 停止云朵动画
 * @param {number} intervalId - 定时器 ID
 */
export const stopCloudAnimation = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};
