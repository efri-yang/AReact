import postal from 'postal/lib/postal.lodash'
import * as actions from 'modules/message/actions'
import { actions as accActions } from 'modules/account'
import preprocess from './preprocess'
import * as C from 'constants'
import * as MC from 'modules/message/constants'
import isMsgAcceptable from 'utils/messageAcceptor'
import { store } from 'redax'
import auth from 'utils/auth'
import translateMsgs from 'utils/msgTranslator'
import i18n from 'i18n'

const { METHOD_ID, MSG_DIR } = MC
const channel = postal.channel('message')

channel.subscribe('convid.set', convid => {
  const { conversationMessages, currentConvid } = store.getState()
  const convMessages = conversationMessages[convid]

  store.dispatch(actions.setCurrentConvid(convid))

  if (convMessages && convMessages.length) {
    const hasUnreadMsgs = convMessages.some(msg => msg.read !== true)
    hasUnreadMsgs && store.dispatch(actions.markConvMsgRead({
      convid: convid,
      maxMsgId: convMessages[convMessages.length - 1].conv_msg_id
    }))
  }

  if (currentConvid !== convid) {
    // 切换会话，重新初始化消息，提高性能(查看更多消息导致消息列表很长的情况)
    // $cache.conversationMessages.get().then(data => {
    //   store.dispatch(actions.initMessages(transformMessages(data)))
    // })
    store.dispatch(actions.sliceConvMessages({convid: currentConvid}))
  }
})

channel.subscribe('conv.msgs.clear', data => store.dispatch(actions.clearConversationMsgs(data)))
channel.subscribe('conv.update', data => store.dispatch(actions.updateConversation(data)))
channel.subscribe('conv.p2p.typing', data => store.dispatch(actions.setTypingP2PConversations(data)))
channel.subscribe('conv.p2p.update', data => store.dispatch(actions.addP2PConversation(data)))
channel.subscribe('conv.group.update', data => store.dispatch(actions.addOrUpdateGroupConversation(data)))
channel.subscribe('conv.remove', data => store.dispatch(actions.removeConversations(data)))
channel.subscribe('message.remove', data => store.dispatch(actions.removeMessage(data)))
channel.subscribe('message.update', data => store.dispatch(actions.updateMessage(data)))
// todo 消息撤回
channel.subscribe('message.recall', data => console.log('data is msg'))
// todo 消息转发
channel.subscribe('message.forward', data => console.log(data.user, data.msg))

channel.subscribe('message.process', ({from, msgs, to}) => {
  let readNotice = {}
  let newMessages = []
  let offlineNotice = null
  let maxMsgId = null

  msgs.forEach(msg => {
    switch (msg.method_id) {
      // 消息已读通知
      case METHOD_ID.CONV_MSG_READ:
        readNotice = {
          convid: from.resource_data.convid,
          maxMsgId: msg.data.conv_msg_id
        }
        break
      // 新消息
      case METHOD_ID.INBOX_MSG_ARRIVED_BATCH:
      case METHOD_ID.INBOX_MSG_ARRIVED:
        const msgData = msg.data
        maxMsgId = msgData.max_inbox_id || (!msgData.ack && msgData.inbox_msg_id)
        newMessages.push(msg)
        break
      // 下线通知，同平台不同设备登录
      case METHOD_ID.KICKED_OFFLINE:
        offlineNotice = msg.data
        break
    }
  })

  if (offlineNotice) {
    return store.dispatch(actions.offline(offlineNotice))
  }

  if (readNotice) {
    store.dispatch(actions.receiveReadNotices(readNotice))
  }

  newMessages = flatMessages(newMessages)

  if (newMessages.length) {
    maxMsgId && store.dispatch(actions.ackInboxMsg(maxMsgId.toString()))
    translateMsgs(newMessages, i18n.language).then(res => {
      store.dispatch(actions.getConversations([...res]))
      store.dispatch(actions.receiveMessages(res))
    })
  }
})

channel.subscribe('message.pull.error', (() => {
  let retry = 0

  return (error = {}) => {
    if (error instanceof Error && error.message === C.NETWORK_ERROR) {
      store.dispatch(actions.offline(error))
    } else {
      const { data = {} } = error

      // saga遇到错误时自动cancel掉task，所以这边执行cancelPolling使generator往下走，等待下一次pullMessage
      store.dispatch(actions.cancelPolling())

      // 碰到token失效错误，重新拿token，否则直接再pullMessages
      if (data.code === C.INVALID_TOKEN) {
        refreshToken()
      } else {
        store.dispatch(actions.pullMessages())
      }
    }
  }

  function refreshToken() {
    if (++retry > C.IM_TOKEN_REFRESH_TIMES) {
      retry = 0
      return store.dispatch(actions.offline({}))
    }
    accActions.fetchImToken({data: auth.getTokens()})
      .then(res => {
        retry = 0
        auth.setImAuth(res.data.msgs[0].data)
        store.dispatch(actions.pullMessages())
      })
      .catch(() => {
        setTimeout(refreshToken, 1000)
      })
  }
})())

const flatMessages = messages => {
  const loginUid = auth.getAuth('user_id')
  let flattedMessages = []
  messages.forEach(item => {
    if (item.method_id === METHOD_ID.INBOX_MSG_ARRIVED) {
      flattedMessages.push(item.data)
    } else {
      flattedMessages.push.apply(flattedMessages, item.data.msg)
    }
  })

  const { currentConvid } = store.getState()
  flattedMessages = flattedMessages.filter(msg => {
    if (currentConvid === msg.convid) {
      msg.read = true
    }

    // 统一标记消息方向、发送者数据
    const resrcData = msg['sender_ua_uri']['resource_data'] || {}
    let sender = {...resrcData}
    msg['_sender'] = sender
    msg['_direction'] = (!sender.uid || parseInt(sender.uid) !== parseInt(loginUid)) ? MSG_DIR.DOWN : MSG_DIR.UP

    return isMsgAcceptable(msg, preprocess)
  })

  return flattedMessages
}

export default channel
