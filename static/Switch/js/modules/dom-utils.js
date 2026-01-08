/**
 * DOM 工具模块
 * 提供 DOM 查询和元素操作的工具函数
 */

/**
 * 创建一个简化的 DOM 查询器
 * @param {ShadowRoot|HTMLElement} root - 查询的根元素
 * @returns {Function} 查询函数
 */
export const createQuerySelector = (root) => {
  return (selector) => {
    const dom = root.querySelectorAll(selector);
    return dom.length === 1 ? dom[0] : dom;
  };
};

/**
 * 获取主题按钮所需的所有 DOM 元素
 * @param {Function} $ - 查询函数
 * @returns {Object} 包含所有 DOM 元素的对象
 */
export const getThemeElements = ($) => {
  return {
    mainButton: $(".main-button"),
    daytimeBackground: $(".daytime-background"),
    cloud: $(".cloud"),
    cloudList: $(".cloud-son"),
    cloudLight: $(".cloud-light"),
    components: $(".components"),
    moon: $(".moon"),
    stars: $(".stars"),
    star: $(".star")
  };
};

/**
 * 批量设置元素样式
 * @param {HTMLElement} element - 目标元素
 * @param {Object} styles - 样式对象
 */
export const setStyles = (element, styles) => {
  Object.entries(styles).forEach(([property, value]) => {
    element.style[property] = value;
  });
};

/**
 * 批量设置多个元素的同一样式
 * @param {NodeList|Array} elements - 元素列表
 * @param {string} property - 样式属性
 * @param {string} value - 样式值
 */
export const setStyleToAll = (elements, property, value) => {
  elements.forEach((element) => {
    element.style[property] = value;
  });
};

/**
 * 设置元素位置
 * @param {HTMLElement} element - 目标元素
 * @param {Object} position - 位置对象 {top, left, right, bottom}
 */
export const setPosition = (element, position) => {
  if (position.top !== undefined) element.style.top = position.top;
  if (position.left !== undefined) element.style.left = position.left;
  if (position.right !== undefined) element.style.right = position.right;
  if (position.bottom !== undefined) element.style.bottom = position.bottom;
};

/**
 * 批量设置元素位置
 * @param {NodeList|Array} elements - 元素列表
 * @param {Array} positions - 位置数组
 */
export const setPositions = (elements, positions) => {
  positions.forEach((position, index) => {
    if (elements[index]) {
      setPosition(elements[index], position);
    }
  });
};
