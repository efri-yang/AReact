import * as $C from 'constants'
import { parseContent } from './helpers'
import auth from 'utils/auth'

const Acceptor = {
  stream: {
    isAccept(jsonData) {
      // only accept message of file/folder received
      let recverClose = jsonData.action
        ? jsonData.action === $C.STREAM_MSG_TYPE.ACTION.RECVER_CLOSE
        : false
      let closeOfFinish = jsonData['close_reason']
        ? parseInt(jsonData['close_reason']) === $C.STREAM_MSG_TYPE.CLOSE_REASON.CLOSE_OF_FINISH
        : false
      if (recverClose && closeOfFinish) {
        return true
      }
      return false
    }
  },

  box: {
    isAccept(jsonData, msgHeaders) {
      if (msgHeaders && msgHeaders['Content-Receivers']) {
        let loginUserId = auth.getAuth('user_id')
        if (msgHeaders['Content-Receivers'].indexOf(loginUserId) === -1) {
          return false // 消息接收者中没有当前登录用户
        }
      }
      return true
    }
  }
  // other msg type added here
}

/**
 * 是否接收显示消息
 * @param {object} msg
 * @param {object} preprocess - msgbus.preprocess
 */
const isMsgAcceptable = (msg, preprocess) => {
  const contentData = parseContent(msg.content)

  let cmd, isIgnore
  if (contentData.data && contentData.data.json && contentData.data.json[contentData.type]) {
    const jsonData = contentData.data.json[contentData.type]
    const msgHeaders = contentData.headers // 消息头
    const acceptor = Acceptor[contentData.type]
    cmd = jsonData.cmd
    isIgnore = $C.IGNORE_MSG_TYPE.includes(cmd) || (acceptor && !acceptor.isAccept(jsonData, msgHeaders))
  }
  preprocess && preprocess.publish(cmd || '*', {msg, contentData})

  return isIgnore !== true
}

export default isMsgAcceptable
