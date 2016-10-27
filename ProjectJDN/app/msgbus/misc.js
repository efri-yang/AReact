import postal from 'postal/lib/postal.lodash'
import moment from 'moment'
import { actions } from 'modules/shared/misc'
import * as MsgActions from 'modules/message/actions'
import * as selectors from 'modules/message/selectors'
import { store } from 'redax'
import { scrollIntoView } from 'utils/helpers'
import sleepWatcher from 'utils/sleepWatcher'
import { INVALID_TOKEN } from 'constants'
import $msg from './msg'
import MSG from 'modules/shared/misc/components/message'
import i18n from 'i18n'

const channel = postal.channel('misc')

channel.subscribe('language.change', lng => {
  if (lng === 'zh') {
    moment.locale('zh-cn')
  } else {
    moment.locale(lng)
  }

  const translateRecentConv = (recentConv, onFinally) => {
    if (recentConv && Object.keys(recentConv).length) {
      store.dispatch(MsgActions.translateConversations({
        lng,
        conversations: recentConv,
        onSuccess: () => {
          onFinally()
        },
        onError: () => {
          onFinally(true)
        }
      }))
    } else {
      onFinally()
    }
  }

  // 翻译所有消息
  const {conversationMessages, recentConversations} = store.getState()
  if (conversationMessages && Object.keys(conversationMessages).length) {
    let loadingId = MSG.loading(i18n.t('translatingMsg'))

    let onFinally = (isError) => {
      MSG.remove(loadingId)
      store.dispatch(actions.changeLanguage(lng))
      isError && MSG.error(i18n.t('translateFailed'))
    }

    let action = MsgActions.translateConvMsgs({
      lng,
      convMsgs: conversationMessages,
      onSuccess: () => {
        translateRecentConv(recentConversations, onFinally)
      },
      onError: () => {
        translateRecentConv(recentConversations, onFinally.bind(null, true))
      }
    })
    store.dispatch(action)
  } else {
    store.dispatch(actions.changeLanguage(lng))
  }
})

/**
 *  locate unread messages
 */
channel.subscribe('sidebar.msg.click', (() => {
  let index = 0
  let contactsWrapper

  return () => {
    const recentConversations = selectors.recentConversationsSelector(store.getState())

    for (let i = index, len = recentConversations.length; i < len; i++) {
      if (scrollIntoViewIfUnread(i)) return
    }

    for (let i = 0; i < index; i++) {
      if (scrollIntoViewIfUnread(i)) return
    }

    index = 0

    function scrollIntoViewIfUnread(i) {
      const conversation = recentConversations[i]
      if (conversation.unreadCount) {
        contactsWrapper = contactsWrapper || document.getElementById('contacts-wrapper')
        const locateElem = document.querySelector(`[data-convid="${conversation.convid}"]`)

        if (locateElem) {
          scrollIntoView(locateElem, contactsWrapper)
          index = ++i
        }

        return true
      }
    }
  }
})())

channel.subscribe('sleepWatcher.start', (() => {
  let task
  let refreshToken = () => {
    task.isRunning() && $msg.publish('message.pull.error', {
      data: {
        code: INVALID_TOKEN
      }
    })
  }

  return pullMessagesTask => {
    task = pullMessagesTask
    sleepWatcher.onWakeUp(refreshToken)
  }
})())

export default channel
