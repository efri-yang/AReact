import postal from 'postal/lib/postal.lodash'
import * as C from 'constants'
import * as CMsg from 'modules/message/constants'
import $msg from 'msgbus/msg'
import $contacts from 'msgbus/contacts'
import $cache from 'cache'
import auth from 'utils/auth'
import * as $h from 'utils/helpers'

const channel = postal.channel('preprocess')

let timeoutFun

channel.subscribe('*', (message, envelope) => {
  const { msg } = message
  const { _sender } = msg
  const userInfo = auth.getAuth()
  const isSelf = _sender.uid === String(userInfo.user_id)
  const isTyping = envelope.topic === C.CTL_MSG_TYPE.TYPEING
  const grouptype = msg.convtype === CMsg.CONVTYPE.GRP
  const isAgent = $h.isAgent(msg.convid)
  if (!isSelf && !grouptype && !isAgent) {
    const currentConvid = $cache.currentConvid.get()
    if (currentConvid === msg.convid) {
      // TODO 输入状态显示
      clearTimeout(timeoutFun)
      $msg.publish('conv.p2p.typing', isTyping)
      timeoutFun = setTimeout(function () {
        $msg.publish('conv.p2p.typing', false)
      }, 5000)
    }
  }
})

channel.subscribe(C.CTL_MSG_TYPE.RECALL_MESSAGE, message => {
  const { contentData } = message
  const msg_time = contentData.data.json.ctl.msg_time
  $msg.publish('message.remove', {key: 'msg_time', value: msg_time})
})

// 群创建
channel.subscribe(C.NTF_MSG_TYPE.GRP_CREATED, message => refreshGroup(message))

// 群成员增加
channel.subscribe(C.NTF_MSG_TYPE.GRP_MB_ADDED, message => refreshGroup(message))

// 群解散
channel.subscribe(C.NTF_MSG_TYPE.NTF_GRP_DISMISSED, message => removeConv(message))

// 被移出群
channel.subscribe(C.NTF_MSG_TYPE.NTF_GRP_MB_DELETED, message => removeConv(message))

// 退出群
channel.subscribe(C.NTF_MSG_TYPE.NTF_GRP_MB_EXIT, message => removeConv(message))

// 群邀请
channel.subscribe(C.NTF_MSG_TYPE.NTF_GRP_INVITE, message => {
  const { contentData } = message
  //const contentData = parseContent(message.content)
  const convid = contentData.data.json.ntf.info.convid
  $msg.publish('convid.set', convid)
})

// 添加好友分组
channel.subscribe(C.NTF_MSG_TYPE.NTF_TAG_ADD, message => refreshFriTag())

// 重命名好友分组
channel.subscribe(C.NTF_MSG_TYPE.NTF_TAG_EDIT, message => refreshFriTag())

// 删除好友分组
channel.subscribe(C.NTF_MSG_TYPE.NTF_TAG_DELETE, message => refreshFriTag())

// 收藏为好友
channel.subscribe(C.NTF_MSG_TYPE.NTF_FRD_WITHOUT_APPROVAL, message => refreshFriend())

// 修改好友信息
channel.subscribe(C.NTF_MSG_TYPE.NTF_FRD_EDIT, message => refreshFriend())

// 删除好友
channel.subscribe(C.NTF_MSG_TYPE.NTF_FRD_DELETE, message => refreshFriend())

// 加入黑名单
channel.subscribe(C.NTF_MSG_TYPE.NTF_BLK_ADD, message => refreshFriend())

// 移除黑名单
channel.subscribe(C.NTF_MSG_TYPE.NTF_BLK_DELETE, message => refreshFriend())

// 添加关心
channel.subscribe(C.NTF_MSG_TYPE.NTF_CONCERN_ADD, message => refreshFriend())

// 移除关心
channel.subscribe(C.NTF_MSG_TYPE.NTF_CONCERN_DELETE, message => refreshFriend())

// 新增好友
channel.subscribe(C.NTF_MSG_TYPE.FRD_APPROVAL, message => refreshFriend())

export default channel

const refreshGroup = () => {
  const limit = 100
  const userInfo = auth.getAuth()
  $contacts.publish('group.get', {
    uri: userInfo.user_id,
    params: {
      $limit: limit
    }
  })
}

const removeConv = message => {
  const { contentData, msg } = message
  const convid = contentData.data.json.ntf.info.convid
  $msg.publish('conv.remove', convid)
  refreshGroup()
  if (convid === $cache.currentConvid.get()) {
    if (window.location.hash.indexOf('#/msg/chat') !== -1) {
      $msg.publish('convid.set', msg.convid)
    }
    if (window.location.hash.indexOf('#/contacts/chat') !== -1) {
      window.location.href = '#/contacts'
    }
  }
}

const refreshFriTag = () => {
  $contacts.publish('friend_tag.get')
}

const refreshFriend = () => {
  const limit = 100
  $contacts.publish('friend.get', {
    $limit: limit
  })
}
