import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import {MSG_DIR} from 'modules/message/constants'
import Contact from 'modules/shared/contacts/components'
import $msg from 'msgbus/msg'
import {MSG_TYPE} from 'constants'

class More extends Component {
  state = {
    menuVisible: false,
    showMenuUpward: false,
    canForward: false, // todo
    canRecall: false
  }

  static propTypes = {
    msgTime: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    msgDirection: React.PropTypes.oneOf([MSG_DIR.DOWN, MSG_DIR.UP]),
    hide: PropTypes.func.isRequired, // 隐藏圆点
    startHidingDot: PropTypes.func.isRequired, // 开始隐藏圆点定时
    stopHidingDot: PropTypes.func.isRequired // 停止隐藏圆点定时
  }

  static defaultProps = {
    visible: false
  }

  menuDisappeaerTimeoutId = undefined

  static contextTypes = {
    getMsgFlowBottomPos: PropTypes.func
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      this.setState({
        menuVisible: false
      })
    }
  }

  render() {
    let {visible} = this.props
    let {menuVisible, canRecall, canForward, menuTopValue} = this.state

    let recall = canRecall
      ? <li onClick={::this._handleRecall}>撤回</li> : null

    let forward = canForward
      ? <li>
        <Contact
          mode="single-checked"
          entrance={<span className={styles['operator']}>转发</span>}
          handleSubmit={::this._handleForward}/>
      </li>
      : null

    return (
      <div style={{display: visible ? 'block' : 'none'}}
        className={styles['more']}
        onClick={::this._handleClick}
        onMouseEnter={::this._handleEnterDot}
        onMouseLeave={::this._handleLeaveDot}
        ref={(c) => (this._node = c)}>
        <span className={styles['dots']}>···</span>
        <div style={{top: menuTopValue, display: menuVisible ? 'block' : 'none'}}
          className={styles['more-menu']}
          onMouseEnter={::this._handleEnterMenu}
          onMouseLeave={::this._handleLeaveMenu}>
          <ul>
            {recall}
            {forward}
            <li onClick={::this._handleDelete}>删除</li>
          </ul>
        </div>
      </div>
    )
  }

  _setTimeout() {
    this.menuDisappeaerTimeoutId = setTimeout(() => {
      this.menuDisappeaerTimeoutId = undefined
      this.setState({
        menuVisible: false
      })
      this.props.hide() // 隐藏圆点
    }, 500)
  }

  _clearTimeout() {
    if (this.menuDisappeaerTimeoutId) {
      clearTimeout(this.menuDisappeaerTimeoutId)
      this.menuDisappeaerTimeoutId = undefined
    }
  }

  _handleEnterDot() {
    this.props.stopHidingDot()
  }

  _handleLeaveDot() {
    this.props.startHidingDot()
    this._setTimeout()
  }

  _handleEnterMenu() {
    this._clearTimeout()
  }

  _handleLeaveMenu() {
    this._setTimeout()
  }

  _handleClick() {
    let {menuVisible, canForward, canRecall} = this.state
    const {msgDirection, msgTime, msg} = this.props

    if (menuVisible) {
      this.setState({
        menuVisible: false
      })
      return
    }

    if (msgDirection === MSG_DIR.UP) {
      if (Date.now() - msgTime < 5 * 60 * 1000) {
        canRecall = true // 五分钟内能撤回
      }
    }

    //todo
    if (msg.content.type !== MSG_TYPE.BOX || msg.content.data.json.box['data-forward'] === 'enable') {
      canForward = true
    }

    let operatorCnt = 1 + canForward + canRecall
    this.setState({
      menuVisible: true,
      canRecall: canRecall,
      canForward: canForward,
      menuTopValue: ::this._getMenuTopValue(operatorCnt)
    })
    this.props.onShowMenu && this.props.onShowMenu()
  }

  _handleRecall() {
    const {msg} = this.props
    this.props.hide()
    $msg.publish('message.recall', msg)
  }

  _handleForward(user) {
    const {msg} = this.props
    console.log('forward', user)
    $msg.publish('message.forward', {user: user, msg: msg})
    this.props.hide()
  }

  _handleDelete() {
    const {msg} = this.props
    $msg.publish('message.remove', {key: 'msg_time', value: msg['msg_time']})
  }

  /**
   * 获取菜单的top值，当消息处于流末尾时，需要向上伸展
   * @param {integer} operatorCnt 菜单项数量
   */
  _getMenuTopValue(operatorCnt) {
    let dotPos = this._node.getBoundingClientRect()
    let msgFlowBtmPos = this.context.getMsgFlowBottomPos()
    let menuHeight = 20 + operatorCnt * 30 // menu height
    let menuShouldUpward = dotPos.top + menuHeight >= msgFlowBtmPos
    return -1 * (menuShouldUpward ? (menuHeight - 20) : 10)
  }
}

export default More
