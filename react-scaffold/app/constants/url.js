import {
  DEVELOPMENT,
  DEBUG,
  PREPRODUCTION,
  PRESSURE,
  PRODUCTION,
  DYEJIA,
  AWS,
  AWSCA,
  CURRENT_ENV
} from './env'

/**
 * 帐号中心
 * @constant {string} UC
 */
export const UC = (function () {
  switch (CURRENT_ENV) {
    case DEVELOPMENT:
    case DEBUG:
    case PREPRODUCTION:
    case PRESSURE:
      return 'http://101uccenter.beta.web.sdp.101.com'
    case AWS:
      return 'https://awsuc.101.com'
    case DYEJIA:
      return 'https://aqapi.dyejia.cn'
    case AWSCA:
      return 'https://uc-awsca.101.com'
    case PRODUCTION:
    default:
      return 'https://aqapi.101.com'
  }
})()
