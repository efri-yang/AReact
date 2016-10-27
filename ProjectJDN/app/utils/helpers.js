import Long from 'long'
import storage from './storage'
import moment from 'moment'
import auth from './auth.js'
import parser from 'utils/messageParser'
import * as $C from 'constants'
import {MSG_DIR} from 'modules/message/constants'
import TWEEN from 'tween.js'
import raf from 'raf'

/**
 * 获取Uint64位，高32位时间戳
 * @param msgTime {BigNumber}
 */
export const getTimestamp = msgTime => {
  if (!msgTime) return 0

  const long = Long.fromString(msgTime.toString())
  return long.high * 1000
}

/**
 * 生成uint64位msg_time
 */
export const generateMsgTime = (() => {
  let seed = 1 // 防止同时发送，增加seed
  return () => generateUint64(seed++, Date.now() / 1000)
})()

export const generateMsgSeq = (() => {
  let seed = 1
  return unsigned => generateUint64(seed++, Date.now() / 1000, unsigned)
})()

export const generateUint64 = (lowBits, highBits, unsigned = 0) => {
  return Long.fromBits(lowBits, highBits, unsigned).toString()
}

export const convertSendMessage = (msgBody) => {
  const {from, to, msgs} = msgBody

  const {msg_time, msg_seq, content, read, resend_flag} = msgs[0].data
  const {convid, convtype} = to[0].resource_data

  return {
    sender_ua_uri: from,
    msg_time,
    msg_seq,
    convtype,
    convid,
    content,
    read,
    resend_flag,
    _sender: {...from['resource_data']},
    _direction: MSG_DIR.UP
  }
}

/**
 * 判断是否代理
 * 支持传入entity对象，或者uid
 */
export const isAgent = arg => {
  if (typeof arg === 'object' && arg !== null) {
    return arg.agentuser
  } else if (typeof arg === 'string' || typeof arg === 'number') {
    return parseInt(arg) >= 281474976710656 && parseInt(arg) <= 4222124650659840
  } else {
    return false
  }
}

/**
 * 获取全局设置
 * @returns {*}
 */
export const getSettings = () => {
  return storage.get($C.SETTINGKEY)
}

/**
 * 简化版Promise.all
 * 与原生的区别是，不管有没有error, 回调都是完整的数据而不是第一个被reject的返回值
 * @param arr {Array} promise数组
 * @returns {Promise}
 */
export const promiseAll = arr => {
  let args = Array.prototype.slice.call(arr)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])

    let remaining = args.length
    let isError = false

    const callback = (i, error) => res => {
      if (error) isError = true

      args[i] = res

      if (--remaining === 0) {
        isError ? reject(args) : resolve(args)
      }
    }

    args.forEach((val, i) => {
      if (typeof val.then === 'function') {
        val
          .then(callback(i))
          .catch(callback(i, true))
      } else {
        callback(i)(val)
      }
    })
  })
}

export const parseContent = content => {
  let contentData
  try {
    if (content) {
      //console.log('original content:', {content: content})
      contentData = typeof content === 'string' ? parser.parse(content) : content
    } else {
      contentData = {type: 'unsupported', data: null}
    }
  } catch (e) {
    //console.log('!!!!!!!parse msg failed, msg data:', content)
    //console.error(e)
    contentData = {type: 'unsupported', data: null}
  }
  return contentData
}

function _getHostFromUrl(url) {
  const matched = url.match(/^(?:https?:)?\/\/([^\/]+)(\/.*)$/i)
  if (matched) {
    return matched[1] || ''
  } else {
    return ''
  }
}

export const replaceAuthInfo = (addr, requestUri = '/') => {
  // 替换规则:
  // ERP、旧版EA平台：
  //   #uckey# ==> `Authorization: ${auth.getAuthentization('GET', '/', host)},request_uri="/",host="${host}"` 的base64编码
  //   #curtime# ==> 当前时间，格式：'YYYY-MM-DD HH:mm:ss'
  //   #workid# #frd_workid# ==> user_id
  // social、公众号、云盘等：
  //   ${auth} => `${auth.getAuthentization('GET', '/', host)}` 经过URI encode
  let host = _getHostFromUrl(addr)
  let newAddr = addr
  if (newAddr.indexOf('#uckey#') !== -1) {
    let authStr = auth.getAuthentization('GET', requestUri, host)
    authStr += `,request_uri="${requestUri}",host="${host}"`
    let encodeAuth = window.btoa('Authorization: ' + authStr)
    newAddr = newAddr.replace('#uckey#', encodeAuth)
  }

  if (newAddr.indexOf('${auth}') !== -1) {
    let authStr = auth.getAuthentization('GET', '/', host)
    let encodeAuth = encodeURIComponent(authStr)
    newAddr = newAddr.replace('${auth}', encodeAuth)
  }

  if (newAddr.indexOf('#curtime#') !== -1) {
    newAddr = newAddr.replace('#curtime#', moment().format('YYYY-MM-DD HH:mm:ss'))
  }

  if (newAddr.indexOf('#workid#') !== -1) {
    let user = auth.getAuth()
    newAddr = newAddr.replace('#workid#', user['user_id'])
  }

  if (newAddr.indexOf('#frd_workid#') !== -1) {
    let user = auth.getAuth()
    newAddr = newAddr.replace('#frd_workid#', user['user_id'])
  }

  return newAddr
}

export const generateHisToken = (convId, host) => {
  const nonce = auth._getNonce()
  const mac = auth._getMac(nonce, 'GET', `/?conv_id=${convId}`, _getHostFromUrl(host))
  return window.btoa(`${mac}\r\n${auth.getAccessToken()}\r\n${nonce}`)
}

export const getUserInfoUrl = uid => {
  const url = `${$C.URL.INFO}/Default.aspx?sid=#uckey#&userid=${uid}&ToUrl=D3DD0CA6B2511FF2790861FEB6B8E888D17BC7D14B9D101C387E6E7C554795D5`
  return replaceAuthInfo(url)
}

export const escape2Html = (str) => {
  let arrEntities = {
    'lt': '<',
    'gt': '>',
    'nbsp': ' ',
    'amp': '&',
    'quot': '"'
  }
  return str.replace(/&(lt|gt|nbsp|amp|quot)/ig, function (all, t) {
    return arrEntities[t]
  })
}

/**
 * 获取用户id、nick_name、real_name、user_name构成的非重复数组
 */
export const getAuthUserNames = () => {
  const userInfo = auth.getAuth()

  if (!userInfo) {
    return []
  }

  let ats = [
    userInfo['user_id']
  ]

  let nickName = userInfo['nick_name']
  let realName = userInfo['org_exinfo']['real_name']
  let userName = userInfo['org_exinfo']['user_name']
  if (nickName) {
    ats.push(nickName)
  }
  // 防止多次重复replace
  if (realName && ats.indexOf(realName) === -1) {
    ats.push(realName)
  }

  if (userName && ats.indexOf(userName) === -1) {
    ats.push(userName)
  }
  return ats
}

/**
 * 滚动元素到视图顶部
 * @param elem
 * @param parent
 */
export const scrollIntoView = (() => {
  let tween = null
  let isComplete = false

  return (elem, parent) => {
    if (tween) {
      tween.stop()
      isComplete = false
    }

    tween = new TWEEN.Tween({x: parent.scrollTop})
      .interpolation(TWEEN.Interpolation.Bezier)
      .to({x: elem.offsetTop}, 300)
      .onUpdate(function () {
        parent.scrollTop = this.x
      })
      .onComplete(function () {
        isComplete = true
      })
      .start()

    raf(animate)

    function animate(time) {
      if (!isComplete) {
        raf(animate)
        TWEEN.update(time)
      }
    }
  }
})()

/**
 * 构造新msg对象，兼容旧的cache数据
 * @param msgs
 * @returns {*}
 */
export const transformMessages = msgs => {
  const loginUid = auth.getAuth('user_id')

  msgs && Object.keys(msgs).forEach(convid => {
    msgs[convid].forEach(msg => {
      if (('_sender' in msg) && ('_direction') in msg) return

      const sender = msg['sender_ua_uri']['resource_data'] || {}

      msg._sender = sender
      msg._direction = (!sender.uid || parseInt(sender.uid) !== parseInt(loginUid)) ? MSG_DIR.DOWN : MSG_DIR.UP
    })
  })

  return msgs
}

export const insertAtCaret = (input, value) => {
  const val = input.value
  const start = input.selectionStart

  if (typeof start === 'number') {
    input.value = `${val.slice(0, start)}${value}${val.slice(input.selectionEnd)}`
    input.selectionStart = input.selectionEnd = start + 1
    input.setSelectionRange(input.selectionStart, input.selectionEnd)
  } else if (document.selection && document.selection.createRange) {
    input.focus()
    const range = document.selection.createRange()
    range.text = value
    range.collapse(false)
    range.select()
  }
}

export const parseMsgHeader = rawMsg => {
  let supportLangs, parameters, templateId
  try {
    const langMatch = /Support-Languages\s*:\s*(.+)\r?\n/ig.exec(rawMsg)
    if (langMatch) {
      supportLangs = langMatch[1].split(',')
    } else {
      supportLangs = null
    }

    const tempMatch = /Language-Template\s*:\s*(.+)\r?\n/ig.exec(rawMsg)
    templateId = tempMatch ? tempMatch[1] : undefined

    const paramMatch = /Language-Parameter\s*:\s*(.+)\r?\n/ig.exec(rawMsg)
    parameters = paramMatch ? JSON.parse(paramMatch[1]) : null
  } catch (e) {
    console.error('parse message header failed!!!')
    supportLangs = null
    templateId = undefined
    parameters = null
  }
  return {supportLangs, templateId, parameters}
}
