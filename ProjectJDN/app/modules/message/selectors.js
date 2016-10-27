import { createSelector } from 'reselect'
import * as $h from 'utils/helpers'
import * as C from './constants'
import { hasUnreadAt } from 'modules/message/components/chat/msgflow/ats'

export const readNoticesSelector = state => state.msgReadNotices
export const conversationMessagesSelector = state => state.conversationMessages
export const currentConvidSelector = state => state.currentConvid

export const currentConvTypingStatusSelector = state => state.typingStatus

export const recentConversationsSelector = createSelector(
  state => state.recentConversations,
  conversationMessagesSelector,
  (conversations, messages) => {
    let recentContacts = []

    Object.keys(conversations).forEach(convid => {
      const convMessages = messages[convid]
      let conversation = conversations[convid]

      conversation.unreadCount = 0
      if (convMessages) {
        conversation.unreadCount = convMessages.filter(msg => msg.read !== true).length
      }

      if (!conversation['_sender']) {
        const senderUaUri = conversation['sender_ua_uri']
        conversation['_sender'] = senderUaUri && senderUaUri['resource_data'] || {}
      }

      recentContacts.push(conversation)
    })

    return recentContacts.sort((a, b) => {
      if (a._stick_time || b._stick_time) {
        const stickTimeA = parseInt(a._stick_time) || 0
        const stickTimeB = parseInt(b._stick_time) || 0
        return stickTimeB - stickTimeA
      }

      return b.msg_time - a.msg_time
    })
  }
)

export const totalUnreadSelector = createSelector(
  recentConversationsSelector,
  (conversations) => {
    let totalUnreadCount = 0

    Object.keys(conversations).forEach(convid => {
      let conversation = conversations[convid]
      if (conversation.unreadCount) {
        totalUnreadCount += conversation.unreadCount
      }
    })

    return totalUnreadCount
  }
)

export const currentChatMessagesSelector = createSelector(
  conversationMessagesSelector,
  currentConvidSelector,
  (messages, convid) => {
    return messages[convid]
  }
)

export const currentConversationSelector = createSelector(
  recentConversationsSelector,
  currentConvidSelector,
  (recentConversations, convid) => {
    return recentConversations.filter(item => item.convid === convid)[0]
  }
)

export const emotionPackagesSelector = createSelector(state => state.emotionPackages,
  emotionPackages => {
    let { packages, otherPackages } = emotionPackages
    if (otherPackages.data) {
      for (let i = 0; i < otherPackages.data.length; i++) {
        const list = otherPackages.data[i].data.items || []
        packages = packages.concat(list)
      }
    }
    let packageIds = []
    for (let m = 0; m < packages.length; m++) {
      packageIds.push(packages[m].pkg_id)
    }
    return {
      packageIds: packageIds
    }
  }
)

export const offlineNoticeSelector = createSelector(
  state => state.offlineNotice,
  notice => {
    return notice
  }
)

export const convAtInfoSelector = createSelector(
  state => state.recentConversations,
  conversationMessagesSelector,
  (conversations, messages) => {
    let convAtInfo = {}
    const userNames = $h.getAuthUserNames()

    Object.values(conversations).forEach((conv) => {
      const { convid, convtype } = conv
      if (convtype === C.CONVTYPE.GRP && messages[convid]) {
        const convMessages = messages[convid]
        const ats = {}
        for (let i = 0; i < convMessages.length; i++) {
          const sender = convMessages[i]['_sender']
          if (!convMessages[i].read || convMessages[i]['_atStatus'] === C.AT_NOTICE_STATUS.UNREAD) {
            userNames.forEach(item => {
              if (hasUnreadAt(convMessages[i], item)) {
                ats[sender.uid] = sender.uid
              }
            })
          }
        }
        const atsKeys = Object.keys(ats)
        if (atsKeys.length > 0) {
          convAtInfo[convid] = atsKeys
        }
      }
    })
    return convAtInfo
  }
)
