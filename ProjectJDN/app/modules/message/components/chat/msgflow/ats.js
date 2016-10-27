import * as $h from 'utils/helpers'
import $bus from 'msgbus'
import {AT_NOTICE_STATUS, CONVTYPE, MSG_DIR} from 'modules/message/constants'

/**
 * highlight the AT@userName in message content
 * @param {string} content - message content
 * @param {integer} msgTime - message time
 * @return {object}
 */
const highlight = (content, msg) => {
  let hasAt = false
  if (/@/.test(content) && msg.convtype === CONVTYPE.GRP && msg['_direction'] === MSG_DIR.DOWN) {
    let ats = $h.getAuthUserNames()

    ats.forEach(item => {
      let regExp = new RegExp(`@${item}`, 'g')
      if (regExp.test(content)) {
        hasAt = true
        content = content.replace(regExp, `<a href="javascript:void(0)" name="${msg['msg_time']}">@${item}</a>`)
      }
    })
  }

  return {
    content,
    hasAt: hasAt && msg['_atStatus'] === undefined,
    next: hasAt && msg['_atStatus'] === undefined ? setToUnread : undefined
  }
}

const changStatus = (msg, newStatus) => {
  if (msg['_atStatus'] !== newStatus) {
    $bus.msg.publish('message.update', {
      key: 'msg_time',
      value: msg['msg_time'],
      convId: msg['convid'],
      newMsg: {...msg, '_atStatus': newStatus, read: true}
    })
  }
}

const setToNone = msg => changStatus(msg, AT_NOTICE_STATUS.NONE)

const setToRead = msg => changStatus(msg, AT_NOTICE_STATUS.READ)

const setToUnread = msg => changStatus(msg, AT_NOTICE_STATUS.UNREAD)

const hasUnreadAt = (msg, item) => {
  if (item) {
    let regExp = new RegExp(`@${item}`, 'g')
    const content = msg.content.data ? msg.content.data.xml : msg.content
    if (regExp.test(content)) {
      return true
    }
  }
  return msg['_atStatus'] === AT_NOTICE_STATUS.UNREAD
}

export default {
  highlight: highlight,
  hasUnreadAt: hasUnreadAt,
  setToNone: setToNone,
  setToRead: setToRead,
  setToUnread: setToUnread
}
