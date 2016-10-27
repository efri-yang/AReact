import { createAction } from 'redux-actions'
import { $inject } from 'redux-async-promise'
import { promiseAll, isAgent } from 'utils/helpers'
import $dp from 'dataProvider'
import $cache from 'cache'
import auth from 'utils/auth'
import i18n from 'i18n'
import * as $h from 'utils/helpers'
import * as T from './actionTypes'
import * as C from './constants'
import translateMsgs from 'utils/msgTranslator'

export const pullMessages = createAction(T.PULL)
export const receiveMessages = createAction(T.RECEIVE_MESSAGES)
export const receiveReadNotices = createAction(T.RECEIVE_READ_NOTICES)
export const removeMessage = createAction(T.REMOVE_MESSAGE)
export const updateMessage = createAction(T.UPDATE_MESSAGE)
export const sliceConvMessages = createAction(T.SLICE_CONV_MSGS)

export const error = createAction(T.ERROR)
export const offline = createAction(T.OFFLINE)
export const cancelPolling = createAction(T.CANCEL_POLLING)

export const setCurrentConvid = createAction(T.SET_CURRENT_CONVID)
export const removeConversations = createAction(T.REMOVE_CONVERSATIONS)

export const initMessages = createAction(T.INIT_MESSAGES,
  messages => ({
    messages: callTranslateConvMsgs(messages, i18n.language)
  }),
  () => ({
    showLoading: true,
    error: {
      text: i18n.t('translateFailed')
    }
  })
)

export const initConversations = createAction(T.INIT_CONVERSATIONS,
  conversations => ({
    conversations: callTranslateConversations(conversations, i18n.language)
  }),
  () => ({
    showLoading: true,
    error: {
      text: i18n.t('translateFailed')
    }
  })
)

export const getConversations = createAction(T.GET_CONVERSATIONS,
  messages => ({
    distinctConversations: getDistinctConversations(messages),
    conversations: $inject(fetchConversations)('distinctConversations'),
    entities: $inject(fetchContacts)('conversations')
  }),
  () => ({
    showLoading: false,
    error: null,
    always(action) {
      if (!action.error) {
        const { payload: { conversations, entities } } = action
        conversations.forEach((conversation, i) => {
          const { data } = conversation
          const entity = entities[i].data
          $cache.conversations.set(data.convid, data)

          if (data.grouptype === C.CONVTYPE.P2P) {
            if (isAgent(entity)) {
              $cache.contacts.agent.set(entity.uri, entity)
            } else {
              $cache.contacts.user.set(entity.user_id, entity)
            }
          } else {
            $cache.contacts.group.set(entity.gid, entity)
          }
        })
      }
    }
  })
)

export const setTypingP2PConversations = createAction(T.SET_TYPING_P2P_CONVERSATIONS)

export const addP2PConversation = createAction(T.ADD_P2P_CONVERSATION,
  options => ({
    options,
    conversations: queryConversations(options),
    entities: $inject(fetchContacts)('conversations', 'options')
  }),
  options => ({
    showLoading: false,
    always(action) {
      if (!action.error) {
        const { payload: { conversations, entities } } = action
        conversations.forEach((conversation, i) => {
          const entity = entities[i].data
          let data = conversation.data.items[0]
          data.convtype = C.CONVTYPE.P2P

          $cache.conversations.set(data.convid, data)
          if (isAgent(entity)) {
            $cache.contacts.agent.set(entity.uri, entity)
          } else {
            $cache.contacts.user.set(entity.user_id, entity)
          }
        })
        options.onSuccess(action.payload)
      }
    }
  })
)

export const addOrUpdateGroupConversation = createAction(T.ADD_OR_UPDATE_GROUP_CONVERSATION)

//export const stickConversation = createAction(T.STICH_CONVERSATION)

export const clearConversationMsgs = createAction(T.CLEAR_CONVERSATION_MSGS)

export const updateConversation = createAction(T.UPDATE_CONVERSATION)

export const sendMessage = createAction(T.SEND_MESSAGE,
  options => ({
    type: options.type,
    msgData: options.data || {},
    msgBody: createMessage(options),
    result: $inject(callSendMessage)('msgBody', 'type')}
  ),
  options => ({
    dispatchPending: options.type !== 'local',
    showLoading: false,
    success: {
      handler: options.onSuccess
    },
    error: {
      text: i18n.t('sendFailure')
    }
  })
)

export const sendTyingMessage = createAction(T.SEND_TYPING_MESSAGE,
  options => ({
    type: options.type,
    msgBody: createMessage(options),
    result: $inject(callSendMessage)('msgBody', 'type')}
  ),
  options => ({
    dispatchPending: false,
    showLoading: false
  })
)

export const updateLocalMessage = createAction(T.UPDATE_LOCAL_MESSAGE,
  options => options,
  options => ({
    showLoading: false
  })
)

export const getEmotionPackages = createAction(T.GET_EMOTION_PACKAGES,
  params => ({
    params: params,
    packages: $dp.emotion.packages.query(params).get(),
    otherPackages: $inject(getAllPackages)('params', 'packages')
  }),
  options => ({
    showLoading: false,
    error: null
  })
)

export const ackInboxMsg = createAction(T.ACK_INBOX_MSG,
  maxMsgId => callAckInboxMsg(maxMsgId),
  () => ({
    showLoading: false,
    error: null
  })
)

export const markConvMsgRead = createAction(T.MARK_CONV_MSG_READ,
  params => ({
    convid: params.convid,
    res: callMarkConvMsgRead(params)
  }),
  () => ({
    showLoading: false,
    error: null
  })
)

export const getConvMsg = createAction(T.GET_CONV_MSG,
  params => ({
    convid: params.convid,
    convType: params.convType,
    historyMsg: callGetConvMsg(params),
    flattedMsg: $inject(parseConvMsgsResult)('historyMsg'),
    lang: i18n.language,
    throwError: true,
    msgList: $inject(translateMsgs)('flattedMsg', 'lang', 'throwError')
  }),
  (params) => ({
    showLoading: false,
    success: {
      handler(data) {
        params.onSuccess && params.onSuccess(params.convid, data)
      }
    },
    error: {
      text: null,
      handler(data) {
        params.onError && params.onError(params.convid, data)
      }
    }
  })
)

export const playAudio = createAction(T.PLAY_AUDIO, // stop playing other audios
  dentryId => dentryId,
  () => ({
    showLoading: false,
    error: null
  })
)

export const translateConvMsgs = createAction(T.TRANSLATE_CONV_MSGS,
  ({lng, convMsgs}) => ({
    convMsgs: callTranslateConvMsgs(convMsgs, lng)
  }),
  (options) => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    },
    error: {
      text: '消息翻译失败',
      handler: options.onError
    }
  })
)

export const translateConversations = createAction(T.TRANSLATE_CONVERSATIONS,
  ({lng, conversations}) => ({
    conversations: callTranslateConversations(conversations, lng)
  }),
  (options) => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    },
    error: {
      text: '消息翻译失败',
      handler: options.onError
    }
  })
)

//------------------------------ non export - private --------------------------------------

const getDistinctConversations = messages => {
  let conversations = {}

  messages.reverse().forEach(item => {
    const convid = item.convid
    if (!conversations[convid]) {
      conversations[convid] = item
    }
  })
  return conversations
}

const fetchConversations = conversations => {
  const requests = Object.keys(conversations).map(convid => {
    return $cache.conversations.get(convid)
      .then(cachedConversation => {
        if (cachedConversation) return {data: cachedConversation}
        return $dp.imcore.api.conversations.replace('CONVID', convid).get()
      })
  })

  return $h.promiseAll(requests)
}

/**
 * 点击用户聊天时，查询会话状态，不存在，由服务端新建
 * 只涉及P2P会话
 * @param options
 * @returns {*}
 */
const queryConversations = options => {
  return $h.promiseAll([$dp.imcore.api.group_p2p.query('to_uri', options.uri).get()])
}

/**
 * contacts 可以是用户、群、代理、应用等
 * @param conversations
 * @returns {*}
 */
const fetchContacts = (conversations, options = {}) => {
  const requests = conversations.map(conversation => {
    let item, request, uri

    if (conversation.data.items) {
      // group_p2p返回的数据结构
      item = conversation.data.items[0]
      item.members = [item.member1, item.member2]
      item.grouptype = C.CONVTYPE.P2P

      delete item.member1
      delete item.member2
    } else {
      item = conversation.data
    }

    const { gid, grouptype, members } = item

    let cachedContact = null

    switch (grouptype) {
      case C.CONVTYPE.P2P:
        const currentUserId = auth.getTokens('user_id')
        uri = members.filter(uid => uid !== String(currentUserId))[0]

        if (!uri) {
          uri = currentUserId
        }

        if (isAgent(uri)) {
          // 代理
          request = $dp.agent.users.get(uri)
          cachedContact = $cache.contacts.agent.get(uri)
        } else {
          request = $dp.uc.users.get(uri)
          cachedContact = $cache.contacts.user.get(uri)
        }
        break
      case C.CONVTYPE.GRP:
        uri = gid
        request = $dp.group.groups.replace('GID', uri).get()
        cachedContact = $cache.contacts.group.get(uri)
        break
      default:
        // ignore meeting
        request = null
    }
    return cachedContact ? {data: cachedContact} : request
  })

  return $h.promiseAll(requests)
}

const createMessage = options => {
  const { content, msg_seq, resend_flag, convid, convtype, msgtype, msg_time, qos_flag } = options

  return {
    msgs: [{
      data: {
        content: `Content-Type: ${msgtype}\r\n\r\n ${content}`,
        qos_flag: qos_flag || 0,
        msg_time: msg_time || $h.generateMsgTime(),
        msg_seq: msg_seq || $h.generateMsgSeq(),
        read: true,
        resend_flag
      },
      method_id: C.METHOD_ID.SEND_CONV_MSG
    }],
    from: {
      service_type: C.SERVICE_TYPE.ACCESS,
      resource_type: C.RESOURCE_TYPE.RESOURCE_TYPE_USER_POINT,
      resource_data: {
        uid: auth.getTokens('user_id'),
        point_id: auth.getImAuth('point_id'),
        platform_type: C.BASE.PLATFORM_TYPE
      }
    },
    to: [{
      service_type: C.SERVICE_TYPE.DISP,
      resource_type: C.RESOURCE_TYPE.RESOURCE_TYPE_CONVERSATION,
      resource_data: {
        convid,
        convtype
      }
    }]
  }
}

/**
 * 发送消息
 * @param options
 * @returns {*|axios.Promise}
 */
const callSendMessage = (msgBody, type) => {
  return type === 'local' ? {data: msgBody} : $dp.im.msg.send(msgBody).post()
}

const callAckInboxMsg = maxMsgId => {
  const uid = auth.getTokens('user_id')

  return $dp.im.msg.send({
    msgs: [{
      data: {
        inbox_msg_id: maxMsgId
      },
      method_id: C.METHOD_ID.ACK_INBOX_MSG
    }],
    from: {
      service_type: C.SERVICE_TYPE.ACCESS,
      resource_type: C.RESOURCE_TYPE.RESOURCE_TYPE_USER_POINT,
      resource_data: {
        uid: uid,
        point_id: auth.getImAuth('point_id'),
        platform_type: C.BASE.PLATFORM_TYPE
      }
    },
    to: [{
      service_type: C.SERVICE_TYPE.SYNC,
      resource_type: C.RESOURCE_TYPE.RESOURCE_TYPE_USER,
      resource_data: {
        uid
      }
    }]
  }).post()
}

const callMarkConvMsgRead = ({maxMsgId, convid}) => {
  const uid = auth.getTokens('user_id')

  return $dp.im.msg.send({
    msgs: [{
      data: {
        conv_msg_id: maxMsgId.toString()
      },
      method_id: C.METHOD_ID.MARK_CONV_MSG_READ
    }],
    from: {
      service_type: C.SERVICE_TYPE.ACCESS,
      resource_type: C.RESOURCE_TYPE.RESOURCE_TYPE_USER_POINT,
      resource_data: {
        uid: uid,
        point_id: auth.getImAuth('point_id'),
        platform_type: C.BASE.PLATFORM_TYPE
      }
    },
    to: [{
      service_type: C.SERVICE_TYPE.DISP,
      resource_type: C.RESOURCE_TYPE.RESOURCE_TYPE_CONVERSATION,
      resource_data: {convid}
    }]
  }).post()
}

const getAllPackages = (params, packages) => {
  let limit = params['$limit']
  const total = packages.data['total']
  if (total > limit) {
    let getPromiseAll = []
    for (let offset = limit; offset < total; offset += limit) {
      getPromiseAll.push(getPackagesByStep({
        $offset: offset,
        $limit: limit
      }))
    }
    return promiseAll(getPromiseAll).then(result => {
      return {
        data: result
      }
    })
  }
  return {data: null}
}

const getPackagesByStep = params => {
  return $dp.emotion.packages.query(params).get()
}

const callGetConvMsg = ({minMsgId, convid, limit}) => {
  const uid = auth.getTokens('user_id')

  return $dp.im.msg.send({
    msgs: [{
      data: {
        conv_msg_id: minMsgId.toString(),
        limit: limit
      },
      method_id: C.METHOD_ID.GET_CONV_MSG
    }],
    from: {
      service_type: C.SERVICE_TYPE.ACCESS,
      resource_type: C.RESOURCE_TYPE.RESOURCE_TYPE_USER_POINT,
      resource_data: {
        uid: uid.toString(),
        point_id: auth.getImAuth('point_id'),
        platform_type: C.BASE.PLATFORM_TYPE
      }
    },
    to: [{
      service_type: C.SERVICE_TYPE.DISP,
      resource_type: C.RESOURCE_TYPE.RESOURCE_TYPE_CONVERSATION,
      resource_data: {convid}
    }]
  }).post()
}

/**
 * 解析后端返回结果，因多处地方要用到该结果，故统一解析
 */
const parseConvMsgsResult = res => {
  let groupList = res.data && res.data.msgs && [].concat(res.data.msgs) || []
  let msgList = []
  groupList.forEach(item => {
    if (item.data && item.data.msgs) {
      msgList = msgList.concat(item.data.msgs)
    }
  })

  return msgList.map(msg => {
    return {
      ...msg,
      method_id: C.METHOD_ID.GET_CONV_MSG
    }
  })
}

const callTranslateConvMsgs = (convMsgs, lang) => {
  let convIdList = Object.keys(convMsgs)
  let allMsgList = []
  convIdList.forEach(convId => {
    let msgs = convMsgs[convId]
    if (msgs.length) {
      // 先给每条消息加上convid
      allMsgList = allMsgList.concat(msgs.map(msg => ({...msg, convId})))
    }
  })

  let translatedConvMsgs = {}
  convIdList.forEach(cid => {
    translatedConvMsgs[cid] = []
  })

  return translateMsgs(allMsgList, lang, true).then(resList => {
    // 将结果按convid分组
    resList.forEach(msg => {
      let cid = msg.convId
      delete msg.convId
      translatedConvMsgs[cid].push(msg)
    })
    return new Promise(resolve => resolve(translatedConvMsgs))
  }).catch(errRes => {
    // 翻译失败时返回原数据
    return new Promise((resolve, reject) => reject(convMsgs))
  })
}

const callTranslateConversations = (conversations, lang) => {
  let convIdList = Object.keys(conversations)
  let msgList = []
  convIdList.forEach(convId => {
    if (conversations[convId].content) {
      msgList.push(conversations[convId])
    }
  })

  return translateMsgs(msgList, lang, true).then(res => {
    res.forEach(item => {
      conversations[item.convid] = item
    })
    return new Promise(resolve => resolve(conversations))
  }).catch(errRes => {
    // 翻译失败时返回原数据
    return new Promise((resolve, reject) => reject(conversations))
  })
}
