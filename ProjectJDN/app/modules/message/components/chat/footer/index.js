import React from 'react'
import { connect } from 'react-redux'
import i18n from 'i18n'
import { createStructuredSelector } from 'reselect'
import LinkedStateMixin from 'react-addons-linked-state-mixin'
import mixin from 'core-decorators/lib/mixin'
import throttle from 'core-decorators/lib/throttle'
import { Scrollbars } from 'react-custom-scrollbars'
import { Icon } from 'modules/shared/misc/components'
import MSG from 'modules/shared/misc/components/message'
import ChatUpload from './upload'
import { selectors as miscSelectors } from 'modules/shared/misc'
import { actions, selectors, constants as C } from 'modules/message'
import * as $h from 'utils/helpers'
import styles from './styles.css'

@mixin(LinkedStateMixin)
class ChatFooter extends React.Component {
  constructor(props) {
    super(props)

    const { conversation } = props
    let initialMsg = conversation && conversation._draft || ''

    this.state = {
      msg: initialMsg
    }
    this.isTyping = false
  }

  componentDidMount() {
    this.resizeContentArea()
  }

  componentWillReceiveProps(nextProps) {
    const { conversation } = this.props
    const { conversation: nextConversation } = nextProps

    if (conversation && nextConversation) {
      const isConversationChanged = conversation.convid !== nextConversation.convid

      if (isConversationChanged) {
        this.saveDraft()
        this.setState({
          msg: nextConversation._draft || ''
        })
      }
    }
  }

  componentDidUpdate() {
    this.resizeContentArea()
  }

  componentWillUnmount() {
    this.saveDraft()
  }

  render() {
    const isMsgEmpty = !this.state.msg.length
    const settings = $h.getSettings() || {}
    const sendTip = `message:sendTip.${settings.shortcutCtrl ? 'ctrlEnter' : 'enterOnly'}`

    return (
      <div className={styles.container}>
        <div className={styles['tool-bar']}>
          <Icon type="biaoqing" className={styles.biaoqing} onClick={::this.notSupported} hidden/>
          <ChatUpload sendFileMessage={::this.sendMessage} />
          <Icon type="yunpanwenjian" className={styles.yunpanwenjian} onClick={::this.notSupported} hidden/>
          <Icon type="jieping" className={styles.jieping} onClick={::this.notSupported} hidden/>
        </div>
        <Scrollbars
          ref="scrollbar"
          onScrollStop={::this.handleScroll}
          className={styles.editor}>
          <textarea ref="content" valueLink={this.linkState('msg')} onKeyDown={::this.handleKeyDown}></textarea>
        </Scrollbars>
        <div className={styles['btn-box']}>
          <button disabled={isMsgEmpty} onClick={::this.handleSubmit} title={i18n.t(sendTip)}>{i18n.t('send')}</button>
        </div>
      </div>
    )
  }

  notSupported() {
    return MSG.info(i18n.t('notImplementYet'))
  }

  handleSubmit() {
    const { msg } = this.state
    const length = msg.length

    if (length) {
      if (length > C.MAX_MESSAGE_LENGTH) {
        return MSG.info(i18n.t('reachMaxLengthLimit'))
      }

      let messages = msg.match(new RegExp(`(.|[\\r\\n]){1,${C.MSG_TRUNCATE_LENGTH}}`, 'g'))

      messages.forEach(message => {
        this.sendMessage(this.props.conversation, message, 'text/plain')
      })
    }
  }

  getOptions(conversation, message, msgtype, data) {
    const { convid, convtype } = conversation
    return {
      type: 'online',
      msgtype: msgtype,
      content: message,
      msg_time: null,
      msg_seq: null,
      os_flag: 0,
      resend_flag: 0,
      convid,
      convtype,
      ...data
    }
  }

  sendMessage(conversation, message, msgtype, data) {
    const self = this
    const options = this.getOptions(conversation, message, msgtype, data)
    this.props.sendMessage({
      ...options,
      onSuccess(res) {
        if (res.type === 'local') {
          return
        }

        const { msgBody, result: {msgs: [{ data }]} } = res

        let msg = $h.convertSendMessage(msgBody)
        msg.send_status = C.SEND_STATUS.SUCCESS
        msg.conv_msg_id = data.conv_msg_id
        msg.msg_time = data.msg_time

        self.props.getConversations([msg])
      }
    })
    this.setState({
      msg: ''
    })
    this.clearDraft()
  }

  sendTyingMessage(conversation, message, msgtype, data) {
    const options = this.getOptions(conversation, message, msgtype, data)
    this.props.sendTyingMessage(options)
    this.isTyping = false
  }

  handleKeyDown(e) {
    const settings = $h.getSettings() || {}
    const { content } = this.refs
    const sendMode = settings.shortcutCtrl ? C.SEND_MODE.CTRL_AND_ENTER : C.SEND_MODE.ENTER_ONLY
    const isEnterPress = e.keyCode === 10 || e.keyCode === 13
    const isCtrlAndEnterPress = isEnterPress && e.ctrlKey

    if (isCtrlAndEnterPress) {
      if (sendMode === C.SEND_MODE.ENTER_ONLY) {
        $h.insertAtCaret(content, '\r\n')
        return this.setState({
          msg: content.value
        })
      } else {
        this.handleSubmit()
        e.preventDefault()
      }
    } else if (isEnterPress && sendMode === C.SEND_MODE.ENTER_ONLY) {
      this.handleSubmit()
      e.preventDefault()
    } else {
      const { conversation } = this.props
      if (conversation.convtype === C.CONVTYPE.P2P && !$h.isAgent(conversation.entity)) {
        this.isTyping = true
        this.sendTyping()
      }
    }
  }

  @throttle(3000)
  sendTyping() {
    this.isTyping && this.sendTyingMessage(this.props.conversation, '{"cmd":"TYPING"}', 'ctl/json', {qos_flag: 1})
  }

  saveDraft() {
    const { conversation } = this.props
    const draft = this.state.msg.trim()

    // 删除会话时，导致conversation有可能为空
    if (!conversation) return

    this.props.updateConversation({
      convid: conversation.convid,
      data: {
        _draft: draft
      }
    })
  }

  clearDraft() {
    const { conversation } = this.props

    this.props.updateConversation({
      convid: conversation.convid,
      data: {
        _draft: ''
      }
    })
  }

  handleScroll() {
    const { content, scrollbar } = this.refs
    this.scrollBottom = content.scrollHeight - scrollbar.getScrollTop()
  }

  resizeContentArea() {
    const { content, scrollbar } = this.refs

    content.style.height = 'auto'
    content.style.height = content.scrollHeight + 'px'
    content.focus()
    scrollbar.scrollTop(content.scrollHeight - this.scrollBottom)
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  conversation: selectors.currentConversationSelector
}), actions)(ChatFooter)
