const LOC_HOSTNAME = location.hostname

// 开发
export const DEVELOPMENT = 1
// 测试
export const DEBUG = 2
// 压测
export const PRESSURE = 3
// 预生产
export const PREPRODUCTION = 4
// 生产
export const PRODUCTION = 5
// 亚马逊 新加坡
export const AWS = 6
// 亚马逊 加州
export const AWSCA = 7
// 党员一家
export const DYEJIA = 8

/**
 * @constant {string} CURRENT_ENV
 */
export const CURRENT_ENV = (function () {
  switch (LOC_HOSTNAME) {
    case '127.0.0.1':
    case 'localhost':
      return DEBUG
    default:
      if (/192\.168|\.dev\.web\.nd$/.test(LOC_HOSTNAME)) {
        return DEBUG
      }
      if (/\.debug\.web\.nd$/.test(LOC_HOSTNAME)) {
        return DEBUG
      }
      if (/\.qa\.web\.sdp\.101\.com$/.test(LOC_HOSTNAME)) {
        return PRESSURE
      }
      if (/\.beta\.web\.sdp\.101\.com$/.test(LOC_HOSTNAME)) {
        return PREPRODUCTION
      }
      if (/\.aws\.101\.com/.test(LOC_HOSTNAME)) {
        return AWS
      }
      if (/\.awsca\.101\.com/.test(LOC_HOSTNAME)) {
        return AWSCA
      }
      if (/\.dyejia\.cn$/.test(LOC_HOSTNAME)) {
        return DYEJIA
      }
      return PRODUCTION
  }
})()
