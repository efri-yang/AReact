import styles from './index.css'
import React, {PropTypes, Component} from 'react'
import {Avatar} from 'modules/shared/misc/components'
import defaultOrgAvatar from 'theme/images/avatar/organization.jpg'

export default class Item extends Component {
  constructor() {
    super()
    this.state = {
      active: false
    }
  }

  static propTypes = {
    mode: PropTypes.string.isRequired, // 用户或者群组
    globalKey: PropTypes.string.isRequired,  // 唯一标识符
    itemData: PropTypes.object,        // 数据
    itemId: PropTypes.string,          // 获取头像用的id
    name: PropTypes.string.isRequired, // 主名
    subName: PropTypes.string,         // 次名
    width: PropTypes.number,
    title: PropTypes.string,
    showAvatar: PropTypes.bool,        // 是否显示头像
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    active: PropTypes.bool
  }

  static defaultProps = {
    width: 200,
    showAvatar: true
  }

  render() {
    let {mode, globalKey, itemId, name,
      subName, title, showAvatar, width, active} = this.props
    let textMaxWidth = showAvatar ? (width - 75) : (width - 25)

    let overlay
    if (showAvatar) {
      overlay = (
        <div
          className={styles['overlay']}
          style={{ width: '100%' }}
          title={title || ''}>
          <div className={styles['avatar']}>
            {mode === 'USER' && <Avatar uri={itemId} type="user" />}
            {mode === 'GROUP' && <Avatar type="group" uri={parseInt(itemId)} />}
            {mode === 'ORG' && <img src={defaultOrgAvatar} />}
          </div>
          <div className={subName ? `${styles['user-item-names']}` : `${styles['group-item-names']}`}>
            <span style={{maxWidth: `${textMaxWidth}px`}}>
              {name}
            </span>
            {subName
              ? <span style={{maxWidth: `${textMaxWidth}px`}} className={styles['node-name']}>{subName}</span>
              : null}
          </div>
        </div>
      )
    } else {
      overlay = (
        <div className={styles['overlay']} title={title || ''}>
          <span style={{maxWidth: `${textMaxWidth}px`}}>
            {name}
          </span>
          {subName
            ? <span style={{maxWidth: `${textMaxWidth}px`}}>{subName}</span>
            : null}
        </div>
      )
    }

    return (
      <li
        key={globalKey}
        className={active ? styles['item-active'] : ''}
        onClick={::this._handleClick}
      >
        {overlay}
      </li>
    )
  }

  _handleClick(e) {
    //e.stopPropagation();
    this.props.onClick && this.props.onClick(this.props.itemData, this.props.name)
  }

}
