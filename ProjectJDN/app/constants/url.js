// 开发
const DEVELOPMENT = 1
// 测试
const DEBUG = 2
// 压测
const PRESSURE = 3
// 预生产
const PREPRODUCTION = 4
// 生产
const PRODUCTION = 5
// 亚马逊
const AWS = 6

export const LOC_PROTOCOL = location.protocol
export const LOC_HOST = location.host
export const LOC_HOSTNAME = location.hostname
export const LOC_PORT = location.port
export const LOC_ORIGIN = `${LOC_PROTOCOL}//${LOC_HOST}`

/**
 * @constant {string} ENV
 */
const ENV = (function () {
  switch (LOC_HOSTNAME) {
    case '127.0.0.1':
    case 'localhost':
      return PRODUCTION
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
      return PRODUCTION
  }
})()

/**
 * 帐号中心
 * @constant {string} UC
 */
export const UC = (function () {
  switch (ENV) {
    case DEVELOPMENT:
    case DEBUG:
    case PREPRODUCTION:
    case PRESSURE:
      return 'http://101uccenter.beta.web.sdp.101.com'
    case PRODUCTION:
      return 'https://aqapi.101.com'
    case AWS:
      return 'https://awsuc.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/**
 * 内容服务
 * @constant {string} CS
 */
export const CS = (function () {
  switch (ENV) {
    case DEVELOPMENT:
    case DEBUG:
    case PREPRODUCTION:
    case PRESSURE:
      return 'http://betacs.101.com'
    case PRODUCTION:
      return 'http://cs.101.com'
    case AWS:
      return 'https://awscs.101.com'
    default:
      return LOC_ORIGIN
  }
})()
/**
 * 内容服务 cdn
 * @constant {string} CDNCS
 */
export const CDNCS = (function () {
  switch (ENV) {
    case DEVELOPMENT:
    case DEBUG:
    case PREPRODUCTION:
    case PRESSURE:
      return 'http://betacs.101.com'
    case PRODUCTION:
      return 'http://cdncs.101.com'
    case AWS:
      return 'https://awscs.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/**
 * @constant {string} TRANSFER_API_ORIGIN 二维码接口
 */
export const TRANSFER = (function () {
  switch (ENV) {
    // 开发
    case DEVELOPMENT:
      return 'http://im-transfer.dev.web.nd'
    // 测试
    case DEBUG:
      return 'http://im-transfer.debug.web.nd'
    // 压测
    case PRESSURE:
      return 'http://im-transfer.qa.web.sdp.101.com'
    // 生产
    case PRODUCTION:
      return 'http://im-transfer.social.web.sdp.101.com'
    // 预生产
    case PREPRODUCTION:
      return 'http://im-transfer.beta.web.sdp.101.com'
    case AWS:
      return 'http://im-transfer.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} AVATAR_URL 用户头像
 */
export const AVATAR = (function () {
  switch (ENV) {
    // 生产
    case PRODUCTION:
      return {
        USER: `${CDNCS}/v0.1/static/cscommon/avatar`,
        GROUP: `${CDNCS}/v0.1/static/im_group_file/{uri}/avatar/{uri}`,
        AGENT: `${CDNCS}/v0.1/static/product_content_im_agent_avata/agent_user_avatar`
      }
    case AWS:
      return {
        USER: `${CS}/v0.1/static/preproduction_content_cscommon/avatar`,
        GROUP: `${CS}/v0.1/static/im_group_file/{uri}/avatar/{uri}`,
        AGENT: `${CS}/v0.1/static/im_agent_avatar/agent_user_avatar`
      }
    default:
      return {
        USER: `${CS}/v0.1/static/preproduction_content_cscommon/avatar`,
        GROUP: `${CS}/v0.1/static/preproduction_content_im_group_f/{uri}/avatar/{uri}`,
        AGENT: `${CS}/v0.1/static/preproduction_content_avatar/agent_user_avatar`
      }
  }
})()

/**
 * 好友
 * @constant {string} FRIEND
 */
export const FRIEND = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://im-friend.dev.web.nd'
    case DEBUG:
      return 'http://im-friend.debug.web.nd'
    case PREPRODUCTION:
      return 'http://im-friend.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://im-friend.qa.web.sdp.101.com'
    case PRODUCTION:
      return 'http://im-friend.web.sdp.101.com'
    case AWS:
      return 'http://im-friend.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} ROAM_MSG 历史消息
 */
export const ROAM_MSG = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://im-roam-message.dev.web.nd'
    case DEBUG:
      return 'http://im-roam-message.debug.web.nd'
    case PREPRODUCTION:
      return 'http://im-roam-message.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://im-roam-message.qa.web.sdp.101.com'
    case PRODUCTION:
      return 'http://im-roam-message.social.web.sdp.101.com'
    case AWS:
      return 'http://im-roam-message.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} GROUP 群组
 */
export const GROUP = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://im-group.dev.web.nd'
    case DEBUG:
      return 'http://im-group.debug.web.nd'
    case PRODUCTION:
      return 'http://im-group.web.sdp.101.com'
    case PREPRODUCTION:
      return 'http://im-group.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://im-group.qa.web.sdp.101.com'
    case AWS:
      return 'http://im-group.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} APPLIST 应用列表
 */
export const APPLIST = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://applist.dev.web.nd'
    case DEBUG:
      return 'http://applist.debug.web.nd'
    case PRODUCTION:
      return 'http://applist.social.web.sdp.101.com'
    case PREPRODUCTION:
      return 'http://applist.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://applist.qa.web.sdp.101.com'
    case AWS:
      return 'http://applist.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} WEBIM
 */
export const IM = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://im-http-access.qa.web.sdp.101.com'
    case DEBUG:
      return 'http://im-http-access.debug.web.nd'
    case PRODUCTION:
      return 'http://im-http-access.edu.web.sdp.101.com'
    case PREPRODUCTION:
      return 'http://im-http-access.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://im-http-access.qa.web.sdp.101.com'
    case AWS:
      return 'http://im-http-access.aws.101.com/'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} TOOLS 工具
 */
export const TOOLS = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://im-tools.dev.web.nd'
    case DEBUG:
      return 'http://im-tools.debug.web.nd'
    case PRODUCTION:
      return 'http://im-tools.social.web.sdp.101.com'
    case PREPRODUCTION:
      return 'http://im-tools.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://im-tools.qa.web.sdp.101.com'
    case AWS:
      return 'http://im-tools.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} IMCORE 双方会话
 */
export const IMCORE = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      // return 'http://imcore.dev.web.nd'
      return 'http://imcore.beta.web.sdp.101.com'
    case DEBUG:
      return 'http://imcore.debug.web.nd'
    case PRODUCTION:
      return 'http://imcore.web.sdp.101.com'
    case PREPRODUCTION:
      return 'http://imcore.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://imcore.qa.web.sdp.101.com'
    case AWS:
      return 'http://imcore.aws.101.com/'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} AGENT 代理
 */
export const AGENT = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://im-agent.dev.web.nd'
    case DEBUG:
      return 'http://im-agent.debug.web.nd'
    case PRODUCTION:
      return 'http://im-agent.web.sdp.101.com'
    case PREPRODUCTION:
      return 'http://im-agent.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://im-agent.qa.web.sdp.101.com'
    case AWS:
      return 'http://im-agent.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} AGENT 代理
 */
export const EMOTION = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://im-emotion.dev.web.nd'
    case DEBUG:
      return 'http://im-emotion.dev.web.nd'
    case PRODUCTION:
      return 'http://im-emotion.social.web.sdp.101.com'
    case PREPRODUCTION:
      return 'http://im-emotion.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://im-emotion.qa.web.sdp.101.com'
    case AWS:
      return 'http://im-emotion.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} OA 公众号
 */
export const OA = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://official-account.dev.web.nd'
    case DEBUG:
      return 'http://official-account.debug.web.nd'
    case PRODUCTION:
      return 'http://official-account.edu.web.sdp.101.com'
    case PREPRODUCTION:
      return 'http://official-account.beta.web.sdp.101.com'
    case PRESSURE:
      return 'http://official-account.qa.web.sdp.101.com'
    case AWS:
      return 'http://official-account.aws.101.com'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} INFO
 */
export const INFO = (function () {
  switch (ENV) {
    case PRODUCTION:
      return 'http://ioa.99.com'
    default:
      return 'http://testioa.99.com'
  }
})()

/*
 * @constant {string} WEIBO
 */
export const WEIBO = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'http://weibo.dev.web.nd/#/homepage/microblog/'
    case DEBUG:
      return 'http://weibo.debug.web.nd/#/homepage/microblog/'
    case PRODUCTION:
      return 'http://weibo.social.web.sdp.101.com/#/homepage/microblog/'
    case PREPRODUCTION:
      return 'http://weibo.beta.web.sdp.101.com/#/homepage/microblog/'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} EMOJI_URL
 */
export const EMOJI_URL = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return `${CS}/v0.1/static/dev_content_im_emotion/emoji`
    case DEBUG:
      return `${CS}/v0.1/static/debug_content_im_emotion/emoji`
    case PRODUCTION:
      return `${CDNCS}/v0.1/static/im_emotion/emoji`
    case PREPRODUCTION:
      return `${CS}/v0.1/static/preproduction_content_im_emotion/emoji`
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} MEDIA_CONVERTION
 */
export const MEDIA_CONVERTION = (function () {
  switch (ENV) {
    case DEVELOPMENT:
    case DEBUG:
    case PREPRODUCTION:
      return 'http://media-convert.beta.web.sdp.101.com/v0.1/api/mp3/converts'
    case PRODUCTION:
      return 'http://media-convert.oth.web.sdp.101.com/v0.1/api/mp3/converts'
    default:
      return LOC_ORIGIN
  }
})()

/*
 * @constant {string} OA_FACE_PATH
 */
export const OA_FACE_PATH = (function () {
  switch (ENV) {
    case DEVELOPMENT:
      return 'preproduction_content_dev_avatar'

    case DEBUG:
      return 'preproduction_content_tes_avatar'

    case PREPRODUCTION:
      return 'preproduction_content_avatar'

    case PRODUCTION:
      return 'product_content_im_agent_avata'

    case AWS:
      return 'im_agent_avatar'

    default:
      return 'product_content_im_agent_avata'
  }
})()

/*
 * @constant {string} IM_HISTORY
 */
export const IM_HISTORY = (function () {
  switch (ENV) {
    case DEVELOPMENT:
    case DEBUG:
    case PREPRODUCTION:
      return 'http://im-his.beta.web.sdp.101.com/?conv_id=#conv_id#&token=#token#&lang=#lang#'
    case PRODUCTION:
      return 'http://im-his.social.web.sdp.101.com/?conv_id=#conv_id#&token=#token#&lang=#lang#'
    default:
      return LOC_ORIGIN
  }
})()
