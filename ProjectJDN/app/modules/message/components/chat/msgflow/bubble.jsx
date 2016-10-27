import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import auth from 'utils/auth'
import {CONVTYPE, MSG_DIR} from 'modules/message/constants'
import More from './more.jsx'
import { isAgent } from 'utils/helpers'
import Avatar from 'modules/shared/misc/components/avatar'

class Bubble extends Component {
  static propTypes = {
    msg: PropTypes.object.isRequired,    // 消息内容
    msgTime: PropTypes.number.isRequired,
    msgNode: PropTypes.element.isRequired, // 消息数据节点，由外层统一解析msg后提供
    msgDirection: React.PropTypes.oneOf([MSG_DIR.DOWN, MSG_DIR.UP]),
    timeComponent: PropTypes.any // 消息时间
  }

  state = {
    showMore: false
  }

  timeoutId = undefined // 显示更多

  render() {
    let {showMore} = this.state
    let {msg, msgNode, msgDirection, timeComponent, msgTime} = this.props
    let {type, data} = msg.content
    let {convtype} = msg
    let senderData = msg['_sender']
    let avatarComp = ::this._getAvatarComponent(msg, msgDirection)

    let cls = cx({
      [styles['msg-item']]: true,
      'up-msg': msgDirection === MSG_DIR.UP,
      'down-msg': msgDirection === MSG_DIR.DOWN,
      'local-msg': type === 'file' && data.json.file.type === 'local'
    })

    let bubbleCls = cx({
      [styles['name-and-msg']]: true,
      [styles['show-name']]: convtype === CONVTYPE.GRP && msgDirection === MSG_DIR.DOWN
    })

    const showMoreOperator = false // 隐藏更多操作功能

    return (
      <div className={cls} data-msgid={this.props['data-msgid']}>
        {timeComponent}
        <div className={data.type === 'img' ? styles['image'] : styles['others']}>
          <div className={styles['avatar']}>
            {avatarComp}
          </div>
          <div className={bubbleCls}>
            {msgDirection === MSG_DIR.DOWN && convtype === CONVTYPE.GRP && senderData
            ? <div className={styles['name']}>{senderData.name || senderData.uid}</div>
            : null}
            <div className={styles['arrow']}></div>
            <div className={styles['wrapper']}>
              <div className={styles['msg']}
                /* 隐藏更多操作功能 */
                /*onMouseEnter={::this._handleMouseEnter}*/
                /*onMouseLeave={::this._handleMouseLeave}*/>
                {msgNode}
              </div>
              {showMoreOperator
              ? <More
                visible={showMore}
                msgDirection={msgDirection}
                msg={msg}
                msgTime={msgTime}
                hide={::this._handleHide}
                startHidingDot={::this._setTimeout}
                stopHidingDot={::this._clearTimeout}/>
              : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  _setTimeout() {
    this.timeoutId = setTimeout(() => {
      this.setState({
        showMore: false
      })
      this.timeoutId = undefined
    }, 500)
  }

  _clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  _handleMouseEnter() {
    this._clearTimeout()

    this.setState({
      showMore: true
    })
  }

  _handleMouseLeave() {
    this._setTimeout()
  }

  _handleHide() {
    this.setState({
      showMore: false
    })
  }

  _getAvatarComponent(msgData, direction) {
    const loginUserId = auth.getAuth('user_id')
    return React.createElement(React.createClass({
      render: function () {
        if (direction === MSG_DIR.DOWN) { // 下行
          let {entity} = msgData
          let sender = msgData['_sender']
          if (entity && isAgent(entity)) {
            return <Avatar uri={entity.uri} type="agent" width="34" height="34"/>
          } else if (isAgent(sender.uid)) {
            return <Avatar uri={sender.uid} type="agent" width="34" height="34"/>
          } else {
            return <Avatar uri={sender.uid} width="34" height="34"/>
          }
        } else { // 上行
          if (isAgent(loginUserId)) {
            return <Avatar uri={loginUserId} type="agent" width="34" height="34"/>
          } else {
            return <Avatar uri={loginUserId} width="34" height="34"/>
          }
        }
      }
    }))
  }
}

export default Bubble
