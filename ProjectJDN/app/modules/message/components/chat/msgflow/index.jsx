import styles from './index.css'
import * as actions from 'modules/message/actions'
import { connect } from 'react-redux'
import React, { Component, PropTypes } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import MsgItem from './msgitem.jsx'
import { getTimestamp } from 'utils/helpers'
import auth from 'utils/auth'
import { MSG_TYPE } from 'constants'
import {MSG_DIR, SEND_STATUS} from 'modules/message/constants'
import MSG from 'modules/shared/misc/components/message'
import i18n from 'i18n'
import { scrollIntoView } from 'utils/helpers'
import ats from './ats'

class MsgFlow extends Component {
  constructor() {
    super()
    this.state = {
      hackedToRenderAgain: false,
      hasMoreMsgs: true,
      loadingMoreMsg: false
    }
    this.imgList = []
    this.t = i18n.getFixedT(null, 'message')
    this.getConvMsgJustNow = false
    this.MSG_FLOW_H = 339
    this.AT_MSG_H = 36
  }

  static propTypes = {
    conversation: PropTypes.object.isRequired,
    msgList: PropTypes.array.isRequired
  }

  static defaultProps = {
    conversation: {},
    msgList: []
  }

  static childContextTypes = {
    convType: PropTypes.number, // 主要用于文件消息判断是否要获取session
    entity: PropTypes.object,
    convid: PropTypes.string,
    getMsgFlowBottomPos: PropTypes.func, // 获取消息流底部位置
    scrollToBottom: PropTypes.func // 子组件加载完毕后可调
  }

  getChildContext() {
    const {convtype: convType, entity, convid} = this.props.conversation
    return {
      convType: convType,
      entity: entity,
      convid: convid,
      getMsgFlowBottomPos: ::this._getMsgFlowBtmPos,
      scrollToBottom: ::this._scrollToBottom
    }
  }

  static contextTypes = {
    convid: PropTypes.string,
    convType: PropTypes.number
  }

  componentDidMount() {
    this.userId = auth.getAuth('user_id')
    if (!this.state.hackedToRenderAgain) {
      this.setState({
        hackedToRenderAgain: true
      })
    }
    this._scrollToBottom()
  }

  componentWillReceiveProps(nextProps) {
    const {convid} = this.props.conversation
    let convChange = convid !== nextProps.conversation.convid // 会话变更
    // 被清空了聊天记录（会话id不变），则显示更多消息
    // const isMsgFlowEmptied = nextProps.msgList.length === 0 &&
    //   this.props.msgList.length > 0
    if (convChange) {
      this.setState({
        hasMoreMsgs: true,
        loadingMoreMsg: false
      })
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const {scroll} = this.refs
    let scrollHeight = scroll.getScrollHeight()
    let scrollTop = scroll.getScrollTop()
    let clientHeight = scroll.getClientHeight()
    this.isScrollAtBottom = (clientHeight + scrollTop) === scrollHeight
  }

  // 关于消息流自动滚动到底部：
  //  目前，仅当新消息到达或者切换会话或者本人发送消息时，才自动滚动到底部
  //  该方法依赖于所有图片数据均有width 和 height值，
  //  若没有高宽值，则在图片加载完成前scrollToBottom会有偏差
  componentDidUpdate(prevProps, prevState) {
    const {convid} = this.props.conversation
    const isConvChange = convid !== prevProps.conversation.convid

    const {scroll} = this.refs
    const newHeight = scroll.getScrollHeight()

    // 有新消息
    const msgLenChange = prevProps.msgList.length !== this.props.msgList.length
    const isNewMsgComing = msgLenChange && !this.getConvMsgJustNow

    // 最新消息是否由本人发送
    const {msgList} = this.props
    const lastMsg = msgList.length ? msgList[msgList.length - 1] : null
    const youSendMsg = lastMsg ? lastMsg['_direction'] === MSG_DIR.UP : false

    if ((this.isScrollAtBottom || youSendMsg && isNewMsgComing) || isConvChange) {
      this._scrollToBottom()
    } else if (this.getConvMsgJustNow) {
      // 获取历史消息时，滚动至获取之前的位置
      scroll.scrollTop(newHeight - this.scrollHeight)
    }
    this.scrollHeight = newHeight
  }

  render() {
    const {msgList} = this.props
    const {t} = this
    const {hasMoreMsgs, loadingMoreMsg} = this.state
    let imgListLength = 0
    let minMsgId = msgList.length ? msgList[0]['conv_msg_id'] - 1 : 0
    let atMsgList = [] // at消息

    // 统计图片数， at消息数
    msgList.forEach(msg => {
      let {type, data} = msg.content

      if (type === MSG_TYPE.IMG) {
        imgListLength++
      } else if (type === MSG_TYPE.RICH) {
        let {img} = data.json.div
        if (img) {
          imgListLength += img.length ? img.length : 1
        }
      }

      // 统计未读at提醒
      if (ats.hasUnreadAt(msg)) {
        let sender = msg['_sender']
        atMsgList.push({
          user: sender.name || sender.uid,
          msg: msg
        })
      }
    })

    let {msgCompList, imgList} = ::this._getMsgCompList(msgList, imgListLength)
    this.imgList = imgList

    let msgFlowHeight = this.MSG_FLOW_H

    let atNotice
    if (atMsgList.length) {
      const atNames = []
      for (let i = 0; i < atMsgList.length; i++) {
        if (!atNames.includes(atMsgList[i].user)) {
          atNames.push(atMsgList[i].user)
        }
      }
      let notice = atNames.length > 1
        ? this.t('somebodyAtYou2', {component: this.t('moreThanOne')})
        : this.t('somebodyAtYou2', {component: atMsgList[0].user})
      atNotice = <span onClick={this._handleClearAts.bind(this, atMsgList)}>{notice}</span>
      msgFlowHeight -= this.AT_MSG_H
    }

    let moreMsgComp = null
    if (loadingMoreMsg) {
      moreMsgComp = (
        <div
          className={styles['more-msg']}>
          {t('loading')}
        </div>
      )
    } else if (hasMoreMsgs && minMsgId > 1) {
      moreMsgComp = (
        <div
          className={styles['has'] + ' ' + styles['more-msg']}
          onClick={this._handleShowMoreMsg.bind(this, minMsgId)}>
          {t('showMoreMessage')}
        </div>
      )
    }

    return (
      <div className={styles['msg-flow']} ref={(c) => (this._msgFlowNode = c)}>
        {atNotice && <div className={styles['at']}>{atNotice}</div>}
        <Scrollbars
          style={{width: '100%', height: msgFlowHeight}}
          renderView={props => <div {...props} id="msg-flow-wrapper"/>}
          ref="scroll">
          {moreMsgComp}
          {msgCompList}
        </Scrollbars>
      </div>
    )
  }

  /**
   * box消息替换
   * @param msgList - 原始消息list
   * @returns {Array} - 替换后的消息list
   */
  _getReplacedMsgList(msgList) {
    let replacedMsgList = []
    let replaceIdMap = {} // 格式：{replaceId: index in replacedMsgList}

    msgList.forEach((msg, i) => {
      let {type, data} = msg.content

      if (type === MSG_TYPE.BOX) {
        let replaceId = data.json.box['data-replaceid']
        let isReplaceTime = data.json.box['data-replacetime']

        if (replaceId) {
          let index = replaceIdMap[replaceId]

          if (index !== undefined) { // replace
            let oldMsg = replacedMsgList[index]
            if (!isReplaceTime) { // 不替换消息时间
              msg['msg_time'] = oldMsg['msg_time']
            }
            replacedMsgList[index] = msg
          } else {
            replacedMsgList.push(msg)
            replaceIdMap[replaceId] = replacedMsgList.length - 1 // save
          }
        } else {
          replacedMsgList.push(msg)
        }
      } else {
        replacedMsgList.push(msg)
      }
    })

    return replacedMsgList
  }

  _generateMsgKey(msg) {
    let {msg_time, msg_seq, conv_msg_id} = msg
    let prefix = msg.lang ? `${msg.lang}-` : ''
    // 增加当前语言，保证语言变更时，气泡重新渲染
    if (conv_msg_id) {
      // 会话id + 会话消息id，保证唯一
      return `${prefix}${this.props.conversation.convid}-${conv_msg_id}`
    } else {
      return `${prefix}${msg_seq || msg_time}`
    }
  }

  _getMsgCompList(msgList, imgCnt) {
    let imgList = []
    let lastMsgTime
    if (!this.userId) {
      this.userId = auth.getAuth('user_id')
    }

    // box 消息替换
    let msgListAfterReplaced = this._getReplacedMsgList(msgList)

    let msgCompList = msgListAfterReplaced.map(function (msg) {
      let {msg_time: msgTime} = msg
      let key = this._generateMsgKey(msg)
      let time = getTimestamp(msgTime)
      let showMsgTime = false
      // 消息发送pending时不显示，防止本地时间与服务端时间差过大而引起的抖动
      if (!lastMsgTime || (time - lastMsgTime > 60 * 1000 &&
         msg['send_status'] !== SEND_STATUS.PENDING)) {
        showMsgTime = true
      }

      lastMsgTime = time

      let defaultProps = {
        key: key,
        'data-msgid': key,
        msg: msg,
        loginUserId: this.userId,
        msgTime: time,
        showMsgTime: showMsgTime
      }

      let props
      let {type, data} = msg.content
      switch (type) {
        case MSG_TYPE.IMG:
          if (data.json.img.type === 'local') {
            props = {...defaultProps}
          } else {
            if (msg['_direction'] === MSG_DIR.UP) {
              if (msg.data && msg.data.imgUrl) { // 本人发送的图片，用浏览器缓存显示
                data.json.img.cacheSrc = msg.data.imgUrl
              }
            }

            imgList.push(data.json.img)
            props = {
              ...defaultProps,
              imgIndex: imgList.length - 1,
              imgListLength: imgCnt,
              onImgChange: this._getImgData.bind(this)
            }
          }
          break
        case MSG_TYPE.RICH:
          let {img} = data.json.div
          let beginIdx = imgList.length
          if (img) {
            imgList = imgList.concat(img.length ? img : [img])
          }
          props = {
            ...defaultProps,
            imgIndexBegin: beginIdx,
            imgListLength: imgCnt,
            onImgChange: this._getImgData.bind(this)
          }
          break
        default:
          props = {...defaultProps}
          break
      }
      return <MsgItem {...props} />
    }.bind(this))

    return {
      imgList: imgList,
      msgCompList: msgCompList
    }
  }

  _getMsgFlowBtmPos() {
    let rect = this._msgFlowNode.getBoundingClientRect()
    return rect.top + rect.height
  }

  _scrollToBottom() {
    this.refs.scroll.scrollToBottom()
  }

  _getImgData(idx) {
    let len = this.imgList.length
    if (idx > len - 1 || idx < 0) {
      return undefined
    }
    return this.imgList[idx]
  }

  _handleShowMoreMsg(minMsgId) {
    if (minMsgId === 1) { // no more history messages
      return
    }
    const limit = 10
    const {convtype: convType, convid} = this.props.conversation

    this.props.getConvMsg({
      convid: convid,
      convType: convType,
      minMsgId: minMsgId,
      limit: limit,
      onSuccess: (queryConvId, {msgList}) => {
        // 会话已切换，不再处理上次的请求
        if (queryConvId !== this.props.conversation.convid) {
          return
        }
        this.getConvMsgJustNow = false
        this.setState({
          loadingMoreMsg: false,
          hasMoreMsgs: msgList.length === limit
        })
      },
      onError: (queryConvId, data) => {
        if (!Array.isArray(data.msgList)) {
          MSG.error(i18n.t('getHistoryMsgFailed'))
        } else {
          MSG.error(i18n.t('translateFailed'))
        }
        // 会话已切换，不再处理上次的请求
        if (queryConvId !== this.props.conversation.convid) {
          return
        }
        this.setState({
          loadingMoreMsg: false
        })
        this.getConvMsgJustNow = false
      }
    })
    this.getConvMsgJustNow = true
    this.setState({
      loadingMoreMsg: true
    })
  }

  _handleClearAts(atMsgList) {
    let atMsgItem = atMsgList.pop()
    let msgId = this._generateMsgKey(atMsgItem.msg)
    ats.setToRead(atMsgItem.msg)
    const msgFlowWrapper = document.getElementById('msg-flow-wrapper')
    const locateElem = document.querySelector(`[data-msgid="${msgId}"]`)
    if (locateElem) {
      scrollIntoView(locateElem, msgFlowWrapper)
    }
  }
}

export default connect(null, actions)(MsgFlow)
