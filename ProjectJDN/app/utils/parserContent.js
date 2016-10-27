import React from 'react'
import i18n from 'i18n'
import Interpolate from 'i18n/interpolate'
import auth from 'utils/auth'
import { parseContent, isAgent, escape2Html } from 'utils/helpers'
import UserName from 'modules/shared/contacts/components/username'
import GroupName from 'modules/group/components/name'
import OaName from 'modules/shared/misc/components/oaname'
import AgentName from 'modules/shared/misc/components/agentname'
import { CTL_MSG_TYPE, TEL_MSG_TYPE, MSG_TYPE, NTF_MSG_TYPE, STREAM_MSG_TYPE, URL } from 'constants'

const userId = auth.getAuth('user_id')
const message = i18n.getFixedT(null, 'message')

export const getContentType = data => {
  const contentData = parseContent(data.content)
  return contentData.type
}

export const getContentNode = (data) => {
  // console.log('##############################datadatadatadata')
  // console.log(data)
  const { content, _sender: sender } = data
  const contentData = parseContent(content)
  // console.log(contentData)
  let xml = contentData.data ? contentData.data.xml : ''
  let str = ''
  let strNode
  switch (contentData.type) {
    case MSG_TYPE.TEXT:
      let htmlStr = contentData.data.json.text.replace(/<img[^>]+>/g, message('face'))
      strNode = <span dangerouslySetInnerHTML={{__html: htmlStr}}></span>
      break
    case MSG_TYPE.TIP:
      str = contentData.data.xml.replace(/<[^>]+>/g, '')
      break
    case MSG_TYPE.IMG:
      xml = xml.replace(new RegExp('<img src="smiley://[^>]+>', 'g'), message('face'))
      str = xml.replace(/<img[^>]+>/g, message('image'))
      break
    case MSG_TYPE.FILE:
      str = contentData.data.json.file.name
      break
    case MSG_TYPE.LINK:
      str = contentData.data.json.link.title
      break
    case MSG_TYPE.AUDIO:
      str = message('audio')
      break
    case MSG_TYPE.ARTICLE:
      str = contentData.data.json.article.item.title || contentData.data.json.article.item[0].title
      break
    case MSG_TYPE.RICH:
      const emojiStr = '<img src="' + URL.EMOJI_URL + '[^>]+>'
      xml = xml.replace(new RegExp(emojiStr, 'g'), message('face'))
      const emotionStr = '<img src="' + URL.EMOTION + '/v0.3/portal/emot[?platform=PC&thumb=0&code=[][^>]+>'
      xml = xml.replace(new RegExp(emotionStr, 'g'), message('face'))
      str = xml.replace(/<img[^>]+>/g, message('image')).replace(/<video[^>]+>/g, message('video')).replace(/<audio[^>]+>/g, message('audio')).replace(/<[^>]+>/g, '')
      str = escape2Html(str)
      strNode = <span dangerouslySetInnerHTML={{__html: str}}></span>
      break
    case MSG_TYPE.VIDEO:
      str = message('video')
      break
    case MSG_TYPE.BOX:
      str = contentData.data.json.box['data-summary']
      break
    case MSG_TYPE.STREAM:
      strNode = parseStream(contentData, sender)
      break
    case MSG_TYPE.NTF:
      strNode = parserNtf(contentData)
      break
    case MSG_TYPE.CTL:
      strNode = parserCtl(contentData, sender)
      break
    default:
      str = ''
      break
  }
  if (!strNode) {
    strNode = <span>{str}</span>
  }
  return strNode
}

export const parserNtf = (content) => {
  const hidden = content.data.json.ntf.hidden
  if (hidden) return

  const user_id = String(auth.getAuth().user_id)
  const { cmd, operator, uri, gid, members, member_grade, type, friend, tag, concern, friend_sender, friend_receiver, oa_id, member } = content.data.json.ntf
  const info = content.data.json.ntf.info || content.data.json.ntf.group_info
  switch (cmd) {
    case NTF_MSG_TYPE.GRP_CREATED://
      if (info.owner_uri === user_id) {
        return members && members.length > 0 ? <Interpolate i18nKey="message:grpCreatedO" component={getMembersNode(members)} /> : <span>{message('grpCreatedP')}</span>
      }
      return <Interpolate i18nKey="message:grpCreated" component={getUserNode(info.owner_uri)} />
    case NTF_MSG_TYPE.GRP_INFO_CHANGED:
      return <Interpolate i18nKey="message:grpInfoChanged" component={getUserNode(operator)} />
    case NTF_MSG_TYPE.GRP_MB_ADDED://
      if (members) {
        if (type === 1) {
          if (members.length === 1 && members[0] === user_id) {
            return <Interpolate i18nKey="message:grpMbAddedP" component={getUserNode(operator)} />
          }
          return <Interpolate i18nKey="message:grpMbAddedF" operator={operator === user_id ? message('you') : getUserNode(operator)} component={getMembersNode(members)} />
        } else if (type === 2) {
          if (info.request_policy === 1) {
            return <Interpolate i18nKey="message:grpMbAddedS" component={getUserNode(operator)} />
          }
          return <Interpolate i18nKey="message:grpMbAddedA" operator={operator === user_id ? message('you') : getUserNode(operator)} component={getMembersNode(members)} />
        } else {
          return <Interpolate i18nKey="message:grpMbAddedS" component={getMembersNode(members)} />
        }
      }
      return <span></span>
    case NTF_MSG_TYPE.GRP_MB_GRD_CHANGED://
      return <Interpolate i18nKey="message:grpMbGrdChanged" component={getMembersNode(members)} value={MEMBER_GRADE[member_grade - 1]} />
    case NTF_MSG_TYPE.GRP_MB_CHANGED://
      const uris = [member.uri]
      return <Interpolate i18nKey="message:grpMbChanged" component={getMembersNode(uris)} />
    case NTF_MSG_TYPE.GRP_MB_DELETED://
      return <Interpolate i18nKey="message:grpMbDeleted" operator={operator === user_id ? message('you') : (isAgent(operator) ? getAgentNode(operator) : getUserNode(operator))} component={getMembersNode(members)} />
    case NTF_MSG_TYPE.GRP_MB_EXIT://
      return <Interpolate i18nKey="message:grpMbExit" component={getUserNode(operator)} />
    case NTF_MSG_TYPE.GRP_ICON_CHANGED://
      return <span>{message('grpIconChanged')}</span>
    case NTF_MSG_TYPE.NTF_GRP_DISMISSED:
      return <Interpolate i18nKey="message:ntfGrpDismissed" value={info.gname} component={operator === user_id ? message('you') : getUserNode(operator)} />
    case NTF_MSG_TYPE.NTF_GRP_MB_DELETED://
      return <Interpolate i18nKey="message:ntfGrpMbDeleted" operator={operator === user_id ? message('you') : getUserNode(operator)} name={info.gname} />
    case NTF_MSG_TYPE.NTF_GRP_MB_EXIT://
      return <span>{message('ntfGrpMbExit', {name: info.gname})}</span>
    case NTF_MSG_TYPE.NTF_GRP_INVITE:
      return <Interpolate i18nKey="message:ntfGrpInvite" operator={getUserNode(operator)} name={info.gname} />
    case NTF_MSG_TYPE.NTF_GRP_INVITE_ACCEPTED:
      return <Interpolate i18nKey="message:ntfGrpInviteAccepted" uri={getUserNode(uri)} name={info.gname} />
    case NTF_MSG_TYPE.NTF_GRP_INVITE_REFUSED:
      return <Interpolate i18nKey="message:ntfGrpInviteRefused" uri={getUserNode(uri)} name={info.gname} />
    case NTF_MSG_TYPE.NTF_GRP_REQUEST:
      return <Interpolate i18nKey="message:ntfGrpRequest" uri={getUserNode(uri)} name={info.gname} />
    case NTF_MSG_TYPE.NTF_GRP_REQUEST_ACCEPTED:
      return <Interpolate i18nKey="message:ntfGrpRequestAccepted" uri={getUserNode(operator)} name={info.gname} />
    case NTF_MSG_TYPE.NTF_GRP_REQUEST_REFUSED:
      return <Interpolate i18nKey="message:ntfGrpRequestRefused" uri={getUserNode(operator)} name={info.gname} />
    case NTF_MSG_TYPE.NTF_RELATED_GRP_DEL://
      return <Interpolate i18nKey="message:ntfRelatedGrpDel" name={getGroupNode(gid)} />
    case NTF_MSG_TYPE.NTF_GRP_ORGNODE_INACTIVE:
      return <Interpolate i18nKey="message:ntfGrpOrgnodeInactive" name={getGroupNode(gid)} />
    case NTF_MSG_TYPE.NTF_FRD_REQUEST:
      return <Interpolate i18nKey="message:ntfFrdRequest" name={getUserNode(uri)} />
    case NTF_MSG_TYPE.NTF_FRD_WITHOUT_APPROVAL:
      return <Interpolate i18nKey="message:ntfFrdWithoutApproval" name={getUserNode(friend.uri)} />
    case NTF_MSG_TYPE.NTF_FRD_DECLINE:
      return <Interpolate i18nKey="message:ntfFrdDecline" name={getUserNode(uri)} />
    case NTF_MSG_TYPE.NTF_REQ_DELETE:
      return <Interpolate i18nKey="message:ntfReqDelete" name={getUserNode(uri)} />
    case NTF_MSG_TYPE.NTF_FRD_EDIT:
      return <Interpolate i18nKey="message:ntfFrdEdit" name={getUserNode(friend.uri)} />
    case NTF_MSG_TYPE.NTF_FRD_DELETE:
      return <Interpolate i18nKey="message:ntfFrdDelete" name={getUserNode(uri)} />
    case NTF_MSG_TYPE.NTF_TAG_ADD://
      return <span>{message('ntfTagAdd', {name: tag.title})}</span>
    case NTF_MSG_TYPE.NTF_TAG_EDIT://
      return <span>{message('ntfTagEdit', {name: tag.title})}</span>
    case NTF_MSG_TYPE.NTF_TAG_DELETE://
      return <span>{message('ntfTagDelete', {name: tag.title})}</span>
    case NTF_MSG_TYPE.NTF_BLK_ADD://
      return <Interpolate i18nKey="message:ntfBlkAdd" name={getUserNode(uri)} />
    case NTF_MSG_TYPE.NTF_BLK_DELETE://
      return <Interpolate i18nKey="message:ntfBlkDelete" name={getUserNode(uri)} />
    case NTF_MSG_TYPE.NTF_CONCERN_ADD://
      return <Interpolate i18nKey="message:ntfConcernAdd" name={getUserNode(concern.uri)} />
    case NTF_MSG_TYPE.NTF_CONCERN_DELETE://
      return <Interpolate i18nKey="message:ntfConcernDelete" name={getUserNode(uri)} />
    case NTF_MSG_TYPE.FRD_APPROVAL:
      return <Interpolate i18nKey="message:frdApproval" name={user_id === friend_receiver.uri ? getUserNode(friend_sender.uri) : getUserNode(friend_receiver.uri)} />
    case NTF_MSG_TYPE.OA_SUBSCRIBE://
      return <Interpolate i18nKey="message:oaSubscribe" name={getOaNode(oa_id)} />
    case NTF_MSG_TYPE.OA_UNSUBSCRIBE://
      return <Interpolate i18nKey="message:oaUnsubscribe" name={getOaNode(oa_id)} />
    case NTF_MSG_TYPE.OA_COLLECT://
      return <Interpolate i18nKey="message:oaCollect" name={getOaNode(oa_id)} />
    case NTF_MSG_TYPE.OA_UNCOLLECT://
      return <Interpolate i18nKey="message:oaUncollect" name={getOaNode(oa_id)} />
    case NTF_MSG_TYPE.OA_CHANGE_INFO:
      return <span>{message('oaChangeInfo')}</span>
    case NTF_MSG_TYPE.OA_CHANGE_MENU:
      return <span>{message('oaChangeMenu')}</span>
    case NTF_MSG_TYPE.OA_CANCEL:
      return <Interpolate i18nKey="message:oaCancel" name={getOaNode(oa_id)} />
  }
  return
}

export const parserCtl = (content, sender) => {
  const userInfo = auth.getAuth()
  const { cmd, recaller_uid } = content.data.json.ctl
  switch (cmd) {
    case CTL_MSG_TYPE.SHAKE_WINDOW:
      if (sender.uid === String(userInfo.user_id)) {
        return <span>{message('shakeWindow1')}</span>
      }
      return <span>{message('shakeWindow2')}</span>
    case CTL_MSG_TYPE.TYPING:
      return <span>{message('typing')}</span>
    case CTL_MSG_TYPE.RECALL_MESSAGE:
      let recallerId = recaller_uid
      if (!recaller_uid || recaller_uid === 'null' || recaller_uid === 'undefined') {
        return <span>{message('messageRecalled')}</span>
      }
      let getNode = isAgent(recallerId) ? getAgentNode : getUserNode
      return <Interpolate i18nKey="message:recallMessage" name={String(userInfo.user_id) === recallerId ? message('you') : getNode(recallerId)} />
  }
  return
}

// 音视频呼叫
export const parseTel = (content) => {
  // todo
  const telInfo = content.data.json.tel
  const cmd = telInfo.cmd
  const telType = telInfo.type === 1 ? message('audio1') : message('video1')
  const caller = telInfo.from.uid
  // const callee = telInfo.to ? telInfo.to.uid : undefined
  let callerName = message('others')
  // let calleeName = message('you')
  if (parseInt(caller) === parseInt(userId)) {
    callerName = message('you')
  }
  switch (cmd) {
    case TEL_MSG_TYPE.TELE_P2P_CALL_REQ:
      return <Interpolate i18nKey="message:teleP2pCallReq" name={callerName} type={telType} />
    case TEL_MSG_TYPE.TELE_P2P_CALL_SUCCESS_NTF:
      return <Interpolate i18nKey="message:teleP2pCallSuccessNtf" type={telType} />
    case TEL_MSG_TYPE.TELE_P2P_CALL_DISC_NTF:
      return <Interpolate i18nKey="message:teleP2pCallDiscNtf" type={telType} />
    case TEL_MSG_TYPE.TELE_P2P_CALL_RSP: // 呼叫应答
    case TEL_MSG_TYPE.TELE_P2P_CALL_ACCEPT_NTF: // 呼叫接受
    default:
      return null
  }
}

export const parseStream = (content, sender) => {
  let {stream} = content.data.json
  let recverClose = stream.action
    ? stream.action === STREAM_MSG_TYPE.ACTION.RECVER_CLOSE
    : false

  let closeOfFinish = stream['close_reason']
    ? parseInt(stream['close_reason']) === STREAM_MSG_TYPE.CLOSE_REASON.CLOSE_OF_FINISH
    : false

  if (recverClose && closeOfFinish) {
    const loginUserId = auth.getAuth('user_id')
    let subject = (!sender.uid || parseInt(sender.uid) !== parseInt(loginUserId)) ? message('others') : message('you')
    let type = stream.folder ? 'folder' : 'file'
    let typeName = message(type)
    let name = stream[type].name
    let msgStr = message('p2pStreamMsg', {subject: subject, type: typeName, name: name})
    return <span>{msgStr}</span>
  }
  return null
}

const getOaNode = oa_id => {
  return <OaName oa_id={oa_id} showIdFirst="true" />
}

const getUserNode = operator => {
  return <UserName uid={operator} showIdFirst="true" />
}

const getGroupNode = gid => {
  return <GroupName gid={gid} showIdFirst="true" />
}

const getMembersNode = members => {
  return <span>
    {
      members.map(function (item, key) {
        return <span key={item}><UserName uid={item} showIdFirst="true" /><span>{key < members.length - 1 ? ', ' : ''}</span></span>
      })
    }
  </span>
}

const getAgentNode = uri => {
  return <AgentName uri={uri} showIdFirst/>
}

const MEMBER_GRADE = [message('member'), message('admin'), message('manager')]
