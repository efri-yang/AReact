import { handleActions } from 'redux-actions'
import $cache from 'cache'
import * as $h from 'utils/helpers'
import * as T from './actionTypes'
import * as C from './constants'
import auth from 'utils/auth'
import isMsgAcceptable from 'utils/messageAcceptor'

export const conversationMessages = handleActions({
  [T.INIT_MESSAGES]: (state, action) => action.payload.messages,
  [`${T.SEND_MESSAGE}-PENDING`]: (state, action) => {
    const { payload: { msgBody, msgData } } = action

    let msg = $h.convertSendMessage(msgBody)
    msg.data = msgData
    msg.send_status = C.SEND_STATUS.PENDING

    return groupAndStoreMessages(state, msg, false)
  },
  [T.SEND_MESSAGE]: {
    next(state, action) {
      const { payload: { msgBody, result, msgData } } = action
      let { msgs: [{ data }] } = result.data

      let msg = $h.convertSendMessage(msgBody)
      msg.send_status =
          msgData.file ? C.SEND_STATUS.PENDING : C.SEND_STATUS.SUCCESS
      msg.conv_msg_id = data.conv_msg_id
      msg.msg_time = data.msg_time
      msg.data = msgData
      return groupAndStoreMessages(state, msg, false)
    },
    throw(state, action) {
      const { payload: { msgBody } } = action

      let msg = $h.convertSendMessage(msgBody)
      msg.send_status = C.SEND_STATUS.FAILURE

      return groupAndStoreMessages(state, msg)
    }
  },
  [T.RECEIVE_MESSAGES]: (state, action) => {
    const { payload } = action
    return groupAndStoreMessages(state, payload)
  },
  [T.REMOVE_MESSAGE]: (state, action) => {
    const { key, value } = action.payload
    let isFound = false
    if (key && value) {
      const convids = Object.keys(state)
      for (let i = 0, len = convids.length; i < len; i++) {
        let messages = state[convids[i]]
        state[convids[i]] = messages.filter(message => {
          if (message[key] === value) {
            isFound = true
            return false
          } else {
            return true
          }
        })
      }
    }

    if (isFound) {
      const newState = {...state}
      storeMessages(newState)
      return newState
    }

    return state
  },
  [T.UPDATE_MESSAGE]: (state, action) => {
    return updateMessage(state, action.payload)
  },
  [T.UPDATE_LOCAL_MESSAGE]: (state, action) => {
    const { msg_time, data } = action.payload
    let isFound = false
    if (data) {
      const convids = Object.keys(state)
      for (let i = 0, len = convids.length; i < len; i++) {
        let messages = state[convids[i]]
        state[convids[i]] = messages.filter(message => {
          if (message.msg_time === msg_time) {
            isFound = true
            const newData = Object.keys(data)
            for (let j = 0; j < newData.length; j++) {
              message[newData[j]] = data[newData[j]]
            }
          }
          return true
        })
      }
    }

    if (isFound) {
      const newState = {...state}
      storeMessages(newState)
      return newState
    }
    return state
  },
  [T.RECEIVE_READ_NOTICES]: (state, action) => {
    const { convid } = action.payload
    return convid ? markConvMsgReadByConvid(state, convid) : state
  },
  [T.MARK_CONV_MSG_READ]: (state, action) => {
    const { convid } = action.payload
    return markConvMsgReadByConvid(state, convid)
  },
  [T.CLEAR_CONVERSATION_MSGS]: (state, action) => {
    const { convid } = action.payload
    return cleanMsgsByConvid(state, convid)
  },
  [T.GET_CONV_MSG]: (state, action) => {
    const { convid, convType, msgList } = action.payload
    if (action.error && !Array.isArray(msgList)) {
      return state
    }
    return unshiftConvMsg(state, convid, convType, msgList)
  },
  [T.SLICE_CONV_MSGS]: (state, action) => {
    const { convid } = action.payload
    return !state[convid] ? state : Object.assign({}, state, {
      [convid]: state[convid].slice(-C.SAVED_MESSAGE_COUNT_PER_CONV)
    })
  },
  [T.TRANSLATE_CONV_MSGS]: (state, action) => {
    let newState = translateConvMsgs(state, action)
    storeMessages(newState)
    return newState
  }
}, {})

export const recentConversations = handleActions({
  [T.INIT_CONVERSATIONS]: (state, action) => action.payload.conversations,
  [T.GET_CONVERSATIONS]: {
    next(state, action) {
      const { payload: {distinctConversations, conversations, entities} } = action

      conversations.forEach((conversation, i) => {
        const { data } = conversation
        const existItem = state[data.convid]
        let distinctConversation = distinctConversations[data.convid]

        distinctConversation.entity = entities[i] && entities[i].data

        if (existItem) {
          distinctConversations[data.convid] = { ...existItem, ...distinctConversation }
        }
      })

      const newState = {...state, ...distinctConversations}

      storeRecentConvsations({...state, ...distinctConversations})

      return newState
    },
    throw(state, action) {
      // TODO error handle
      return state
    }
  },
  [T.ADD_P2P_CONVERSATION]: {
    // only handling successful request
    next(state, action) {
      const { payload: {conversations, entities} } = action
      let distinctConversations

      conversations.forEach((conversation, i) => {
        if (conversation.data.items) {
          const item = conversation.data.items[0]
          item.grouptype = C.CONVTYPE.P2P
          item.convtype = C.CONVTYPE.P2P

          if (!state[item.convid]) {
            distinctConversations = distinctConversations || {}
            item.msg_time = $h.generateMsgTime()
            item.entity = entities[i] && entities[i].data
            distinctConversations[item.convid] = item
          }
        }
      })

      if (distinctConversations) {
        state = {...state, ...distinctConversations}
        storeRecentConvsations(state)
      }

      return state
    }
  },
  [T.ADD_OR_UPDATE_GROUP_CONVERSATION]: (state, action) => {
    const { payload } = action
    let item = {...payload}

    const existItem = state[item.convid]
    if (!existItem) {
      item.grouptype = item.convtype = C.CONVTYPE.GRP
      item.msg_time = $h.generateMsgTime()
      item.entity = payload
      state = { ...state, [item.convid]: item }
    } else {
      existItem.entity = payload
      state = { ...state }
    }

    storeRecentConvsations(state)

    return state
  },
  [T.REMOVE_CONVERSATIONS]: (state, action) => {
    let { payload: convids } = action
    let newState = { ...state }

    convids = [].concat(convids)

    convids.forEach(convid => {
      delete newState[convid]
    })

    storeRecentConvsations(newState)
    return newState
  },
  [T.UPDATE_CONVERSATION]: (state, action) => {
    const { convid, data } = action.payload
    let existItem = state[convid]

    if (!existItem) return state

    existItem = {...existItem, ...data}
    state = { ...state, [convid]: existItem }
    storeRecentConvsations(state)

    return state
  },
  [T.TRANSLATE_CONVERSATIONS]: (state, action) => {
    let newState = translateConversations(state, action)
    storeRecentConvsations(newState)
    return newState
  }
}, {})

export const currentConvid = handleActions({
  [T.SET_CURRENT_CONVID]: (state, action) => {
    const { payload } = action

    if (payload) {
      $cache.currentConvid.set(payload)
    }

    return payload
  }
}, $cache.currentConvid.get())

export const emotionPackages = handleActions({
  [T.GET_EMOTION_PACKAGES]: {
    next(state, action) {
      const { packages, otherPackages } = action.payload

      return {
        packages: packages.data.items,
        otherPackages: otherPackages
      }
    }
  }
}, {
  packages: [],
  otherPackages: []
})

export const offlineNotice = handleActions({
  [T.OFFLINE]: (state, action) => {
    return action.payload
  }
}, null)

export const playingAudio = handleActions({
  [T.PLAY_AUDIO]: (state, action) => {
    return action.payload
  }
}, null)

export const typingStatus = handleActions({
  [T.SET_TYPING_P2P_CONVERSATIONS]: (state, action) => action.payload
}, false)

export const typingMsg = handleActions({
  [T.SEND_TYPING_MESSAGE]: (state, action) => action.payload
}, {})

//------------------------------ non export - private --------------------------------------

const groupAndStoreMessages = (old, messages, shouldStore = true) => {
  const latest = { ...old }

  messages = [].concat(messages)

  messages.forEach(msg => {
    const { convid } = msg
    let msgs = latest[convid]

    if (msgs) {
      let replaced = false
      msgs = msgs.map(item => {
        let shouldReplace = false
        if (msg.msg_seq && item.msg_seq === msg.msg_seq) {
          shouldReplace = true
          replaced = true
        } else if (msg.conv_msg_id && item.conv_msg_id === msg.conv_msg_id) {
          shouldReplace = true
          replaced = true
        }
        return shouldReplace ? { ...item, ...msg } : item
      })

      latest[convid] = replaced ? msgs : msgs.concat(msg)
    } else {
      latest[convid] = [msg]
    }
  })

  shouldStore && storeMessages(latest)

  return latest
}

const storeRecentConvsations = data => {
  $cache.recentConversations.set(data)
}

const storeMessages = data => {
  let storeData = {}

  Object.keys(data).forEach(convid => {
    storeData[convid] = data[convid].slice(-C.SAVED_MESSAGE_COUNT_PER_CONV).map(msg => {
      // delete msg.data
      return {...msg, data: null}
    })
  })

  $cache.conversationMessages.set(storeData)
}

const markConvMsgReadByConvid = (state, convid) => {
  let messages = state[convid]
  messages.forEach(msg => {
    msg.read = true
  })

  const newState = Object.assign({}, state, {
    [convid]: messages
  })
  storeMessages(newState)
  return newState
}

const cleanMsgsByConvid = (state, convid) => {
  const newState = Object.assign({}, state, {
    [convid]: []
  })
  storeMessages(newState)
  return newState
}

const unshiftConvMsg = (state, convid, convType, msgList) => {
  let loginUid = auth.getAuth('user_id')
  let historyMsgList = msgList.reverse().filter(msg => {  // 消息过滤
    // 数据补齐
    msg.read = true
    msg.convtype = convType
    msg['_atStatus'] = 0
    msg['_sender'] = {
      uid: msg['sender_uid']
    }
    msg['_direction'] = (!msg['sender_uid'] || parseInt(msg['sender_uid']) !== parseInt(loginUid))
      ? C.MSG_DIR.DOWN : C.MSG_DIR.UP
    msg['_history'] = 1

    return isMsgAcceptable(msg)
  })

  let newMsgList = state[convid] || []
  newMsgList = historyMsgList.concat(newMsgList)
  const newState = Object.assign({}, state, {
    [convid]: newMsgList
  })
  return newState
}

const updateMessage = (state, updateInfo, shouldStore = true) => {
  let {key, value, newMsg, convId} = updateInfo
  let isFound = false

  let update = (cid) => {
    let messages = state[cid]
    if (messages) {
      isFound = true
      state[cid] = messages.map(msg => {
        if (msg[key] === value) {
          return newMsg
        } else {
          return msg
        }
      })
    }
  }

  if (key && value && newMsg) {
    if (convId && state[convId]) { // has convId
      update(convId)
    } else {
      const convids = Object.keys(state)
      convids.forEach((cid) => {
        update(cid)
      })
    }
  }

  if (isFound) {
    const newState = {...state}
    shouldStore && storeMessages(newState)
    return newState
  }

  return state
}

const translateConvMsgs = (state, action) => {
  let newState = {...state}
  let {convMsgs} = action.payload
  // 三重循环！
  Object.keys(newState).forEach(convid => {
    let translatedMsgs = convMsgs[convid]
    if (translatedMsgs) {
      newState[convid].forEach(msg => {
        let key = 'conv_msg_id'
        let idx = findInObjArray(translatedMsgs, key, msg[key])
        if (idx !== -1) {
          msg.content = translatedMsgs[idx].content
          msg.lang = translatedMsgs[idx].lang
        }
      })
    }
  })
  return newState
}

const translateConversations = (state, action) => {
  let newState = {...state}
  let {conversations} = action.payload
  Object.keys(newState).forEach(convid => {
    let translatedConv = conversations[convid]
    if (translatedConv) {
      newState[convid].content = translatedConv.content
      newState[convid].lang = translatedConv.lang
    }
  })
  return newState
}

const findInObjArray = (array, key, value) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return i
    }
  }
  return -1
}
