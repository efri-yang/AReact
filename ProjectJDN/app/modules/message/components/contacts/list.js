import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { selectors as miscSelectors } from 'modules/shared/misc'
import i18n from 'i18n'
import Item from './item'
import * as actions from '../../actions'
import * as selectors from '../../selectors'
import * as $h from 'utils/helpers'
import styles from './styles'

class List extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  constructor() {
    super()
    this.t = i18n.getFixedT(null, 'message')
    this.hideMenu = this.hideMenu.bind(this)
    this.menuPosition = {
      top: 0,
      left: 0
    }
    this.menuDimension = {
      width: 102,
      height: 108
    }
    this.operatedConv = null
    this.state = {
      isMenuVisible: false
    }
  }

  onContextMenu(e, data) {
    e.preventDefault()

    const wrapperRect = this.wrapper.getBoundingClientRect()
    const scrollTop = this.wrapper.parentNode.scrollTop
    const wrapperClientHeight = this.wrapperClientHeight || (this.wrapperClientHeight = this.wrapper.parentNode.parentNode.clientHeight)

    this.menuPosition = {
      top: e.clientY - wrapperRect.top,
      left: e.clientX - wrapperRect.left
    }

    if (wrapperRect.right - e.clientX < this.menuDimension.width) {
      this.menuPosition.left -= this.menuDimension.width
    }

    if (this.menuPosition.top + this.menuDimension.height > scrollTop + wrapperClientHeight) {
      this.menuPosition.top -= this.menuDimension.height
    }

    this.operatedConv = data
    this.showMenu()
  }

  updateConv(data) {
    const { operatedConv } = this

    if (operatedConv) {
      this.props.updateConversation({
        convid: operatedConv.convid,
        data
      })
    }
  }

  toggleStick() {
    const { operatedConv } = this

    this.updateConv({
      _stick_time: operatedConv._stick_time ? '' : $h.generateMsgTime()
    })
  }

  removeConv() {
    const { operatedConv } = this
    const isActive = operatedConv.convid === this.props.currentConvid

    this.props.removeConversations(operatedConv.convid)

    if (isActive) {
      this.context.router.replace('/msg')
    }
  }

  clearConvMsgs() {
    const { operatedConv } = this

    this.props.clearConversationMsgs({
      convid: operatedConv.convid
    })

    this.updateConv({
      content: ''
    })
  }

  showMenu() {
    document.addEventListener('click', this.hideMenu)
    this.setState({
      isMenuVisible: true
    })
  }

  hideMenu() {
    document.removeEventListener('click', this.hideMenu)
    this.operatedConv = null
    this.setState({
      isMenuVisible: false
    })
  }

  render() {
    const { recentConversations } = this.props
    const { operatedConv, menuPosition, t } = this
    const isSticky = operatedConv && !!operatedConv._stick_time

    return (
      <ul ref={(c) => (this.wrapper = c)}>
        {
          recentConversations.map(item => {
            return item.convid && (
              <Item
                key={item.convid}
                onContextMenu={e => this.onContextMenu(e, item)}
                data={item}
                isActive={item.convid === this.props.currentConvid}
                isOperated={operatedConv && item.convid === operatedConv.convid} />
              )
          })
        }
        {
          this.state.isMenuVisible && (
            <div className={styles['handle-box']} style={menuPosition} onContextMenu={e => e.preventDefault()}>
              <span onClick={::this.toggleStick}>{isSticky ? t('cancelStick') : t('stick')}</span>
              <span onClick={::this.removeConv}>{t('delConv')}</span>
              <span onClick={::this.clearConvMsgs}>{t('cleanConvMsgs')}</span>
            </div>
          )
        }
      </ul>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  recentConversations: selectors.recentConversationsSelector,
  currentConvid: selectors.currentConvidSelector
}), actions)(List)
