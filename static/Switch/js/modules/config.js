/**
 * 主题切换组件配置模块
 * 包含所有样式常量和位置配置
 */

// 日间模式样式配置
export const DAY_STYLES = {
  button: {
    transform: "translateX(0)",
    backgroundColor: "rgba(255, 195, 35,1)",
    boxShadow: "3em 3em 5em rgba(0, 0, 0, 0.5), inset  -3em -5em 3em -3em rgba(0, 0, 0, 0.5), inset  4em 5em 2em -2em rgba(255, 230, 80,1)"
  },
  background: {
    transforms: ["translateX(0)", "translateX(0)", "translateX(0)"]
  },
  cloud: {
    transform: "translateY(10em)"
  },
  container: {
    backgroundColor: "rgba(70, 133, 192,1)"
  },
  moon: {
    opacity: "0"
  },
  stars: {
    transform: "translateY(-125em)",
    opacity: "0"
  }
};

// 夜间模式样式配置
export const NIGHT_STYLES = {
  button: {
    transform: "translateX(110em)",
    backgroundColor: "rgba(195, 200,210,1)",
    boxShadow: "3em 3em 5em rgba(0, 0, 0, 0.5), inset  -3em -5em 3em -3em rgba(0, 0, 0, 0.5), inset  4em 5em 2em -2em rgba(255, 255, 210,1)"
  },
  background: {
    transforms: ["translateX(110em)", "translateX(80em)", "translateX(50em)"]
  },
  cloud: {
    transform: "translateY(80em)"
  },
  container: {
    backgroundColor: "rgba(25,30,50,1)"
  },
  moon: {
    opacity: "1"
  },
  stars: {
    transform: "translateY(-62.5em)",
    opacity: "1"
  }
};

// 鼠标悬停时的位置配置 - 夜间模式
export const HOVER_NIGHT_POSITIONS = {
  button: {
    transform: "translateX(100em)"
  },
  background: {
    transforms: ["translateX(100em)", "translateX(73em)", "translateX(46em)"]
  },
  stars: [
    { top: "10em", left: "36em" },
    { top: "40em", left: "87em" },
    { top: "26em", left: "16em" },
    { top: "38em", left: "63em" },
    { top: "20.5em", left: "72em" },
    { top: "51.5em", left: "35em" }
  ]
};

// 鼠标悬停时的位置配置 - 日间模式
export const HOVER_DAY_POSITIONS = {
  button: {
    transform: "translateX(10em)"
  },
  background: {
    transforms: ["translateX(10em)", "translateX(7em)", "translateX(4em)"]
  },
  clouds: [
    { right: "-24em", bottom: "10em" },
    { right: "-12em", bottom: "-27em" },
    { right: "17em", bottom: "-43em" },
    { right: "46em", bottom: "-39em" },
    { right: "70em", bottom: "-65em" },
    { right: "109em", bottom: "-54em" },
    { right: "-23em", bottom: "10em" },
    { right: "-11em", bottom: "-26em" },
    { right: "18em", bottom: "-42em" },
    { right: "47em", bottom: "-38em" },
    { right: "74em", bottom: "-64em" },
    { right: "110em", bottom: "-55em" }
  ]
};

// 默认星星位置（鼠标移出时）
export const DEFAULT_STAR_POSITIONS = [
  { top: "11em", left: "39em" },
  { top: "39em", left: "91em" },
  { top: "26em", left: "19em" },
  { top: "37em", left: "66em" },
  { top: "21em", left: "75em" },
  { top: "51em", left: "38em" }
];

// 默认云朵位置（鼠标移出时）
export const DEFAULT_CLOUD_POSITIONS = [
  { right: "-20em", bottom: "10em" },
  { right: "-10em", bottom: "-25em" },
  { right: "20em", bottom: "-40em" },
  { right: "50em", bottom: "-35em" },
  { right: "75em", bottom: "-60em" },
  { right: "110em", bottom: "-50em" },
  { right: "-20em", bottom: "10em" },
  { right: "-10em", bottom: "-25em" },
  { right: "20em", bottom: "-40em" },
  { right: "50em", bottom: "-35em" },
  { right: "75em", bottom: "-60em" },
  { right: "110em", bottom: "-50em" }
];

// 动画配置
export const ANIMATION_CONFIG = {
  clickCooldown: 500,  // 点击冷却时间(ms)
  cloudMoveInterval: 1000,  // 云朵移动间隔(ms)
  randomDirections: ["2em", "-2em"]  // 随机移动方向
};
