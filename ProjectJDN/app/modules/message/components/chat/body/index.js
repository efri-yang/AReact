import React from 'react'
import { connect } from 'react-redux'
import * as actions from 'modules/message/actions'
import { createStructuredSelector } from 'reselect'
import { selectors } from 'modules/message'
import { selectors as miscSelectors } from 'modules/shared/misc'
import MsgFlow from 'modules/message/components/chat/msgflow'
import $dp from 'dataProvider'
import $cache from 'cache'
import {CONVTYPE} from 'modules/message/constants'
import {promiseAll, isAgent, parseContent} from 'utils/helpers'
import styles from './styles.css'

class ChatBody extends React.Component {
  constructor(props) {
    super()
    this.state = {
      storageUpdate: false
    }
  }

  render() {
    const {messages, conversation} = this.props
    const convType = conversation ? conversation.convtype : undefined
    console.log('original messsages:', messages)

    let msgList = []
    let unnamedUsers = []
    messages && messages.forEach(msg => {
      let msgContent = parseContent(msg.content)
      console.log('parser return:', {...msg, content: msgContent})
      // 获取参与群聊的所有用户id
      const sender = msg['_sender']
      if (convType === CONVTYPE.GRP) {
        let senderCachedInfo = null
        if (isAgent(sender.uid)) {
          senderCachedInfo = $cache.contacts.agent.get(sender.uid)
        } else {
          senderCachedInfo = $cache.contacts.user.get(sender.uid)
        }
        if (senderCachedInfo) {
          sender.name = isAgent(sender.uid)
          ? senderCachedInfo['cachename']
          : senderCachedInfo['org_exinfo.real_name'] || senderCachedInfo['nick_name'] || senderCachedInfo['user_name']
        } else {
          unnamedUsers.push(sender.uid)
        }
      }
      if (msgContent.type && msgContent.type !== 'unsupported') {
        msgList.push({...msg, content: msgContent})
      }
    })

    if (unnamedUsers.length) {
      this._getUserNames(unnamedUsers)
    }

    return (
      <div className={styles.container}>
        <MsgFlow
          conversation={conversation || {}}
          msgList={msgList}/>
      </div>
    )
  }

  _getUserNames(uidList) {
    if (!uidList || !uidList.length) {
      return
    }
    const userIdList = []
    const uaIdList = []
    uidList.forEach(id => {
      if (isAgent(id)) {
        // 代理
        uaIdList.push(id)
      } else {
        userIdList.push({user_id: id})
      }
    })
    if (uaIdList.length) {
      this._getUAInfo(uaIdList)
    }
    if (userIdList.length) {
      this._getUserInfo(userIdList)
    }
  }

  _getUserInfo(userIdList) {
    if (!userIdList || !userIdList.length) {
      return
    }
    const that = this
    $dp.uc.users.queryRealm.send().post({
      data: userIdList
    }).then(response => {
      const {data} = response
      if (data && data.items && data.items.length) {
        data.items.forEach(item => {
          $cache.contacts.user.set(item['user_id'], item)
        })
        that.setState({
          storageUpdate: !that.state.storageUpdate
        })
      }
    }).catch(response => {
      console.error(response)
    })
  }

  _getUAInfo(uaIdList) {
    if (!uaIdList || !uaIdList.length) {
      return
    }
    const that = this
    const fetchList = uaIdList.map(id => (
      $dp.agent.users.get(id)
    ))
    promiseAll(fetchList).then(allResponse => {
      let shouldUpdate = false
      if (allResponse.length) {
        allResponse.forEach(response => {
          let {data} = response
          if (data && data.uri) {
            $cache.contacts.agent.set(data.uri, data)
            shouldUpdate = true
          }
        })
      }
      if (shouldUpdate) {
        that.setState({
          storageUpdate: !that.state.storageUpdate
        })
      }
    })
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  messages: selectors.currentChatMessagesSelector,
  conversation: selectors.currentConversationSelector
}), actions)(ChatBody)
