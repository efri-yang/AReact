import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import i18n from 'i18n'
import classNames from 'classnames'
import { Icon } from 'modules/shared/misc/components'
import MsgAvatar from './common/avatar'
import MsgTime from './common/time'
import EntityName from './common/name'
import MsgContent from './common/content'
import { selectors, actions } from 'modules/message'
import $bus from 'msgbus'
import { scrollIntoView } from 'utils/helpers'

import styles from './styles'

class MsgItem extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    // 用于判断是否把激活会话显示在最上
    this.shouldScrollIntoView = true
    this.t = i18n.getFixedT(null, 'message')
  }

  componentDidMount() {
    this.scrollIntoViewIfNeeded()
  }

  componentWillReceiveProps(nextProps) {
    const alreadyActive = this.props.isActive && nextProps.isActive

    if (alreadyActive) {
      this.shouldScrollIntoView = false
    } else if (!nextProps.isActive) {
      this.shouldScrollIntoView = true
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.scrollIntoViewIfNeeded()
  }

  scrollIntoViewIfNeeded() {
    const { isActive } = this.props

    if (isActive && this.shouldScrollIntoView) {
      const wrapper = this.wrapper || (this.wrapper = document.getElementById('contacts-wrapper'))
      scrollIntoView(ReactDOM.findDOMNode(this), wrapper)
    }
  }

  handleSelect() {
    const { data } = this.props

    this.shouldScrollIntoView = false
    $bus.msg.publish('convid.set', data.convid)

    if (!this.context.router.isActive('/msg/chat')) {
      this.context.router.replace('/msg/chat')
    }
  }

  removeConv(e) {
    e.stopPropagation()

    const { data, isActive } = this.props

    if (isActive) {
      this.context.router.replace('/msg')
    }

    this.props.removeConversations(data.convid)
  }

  render() {
    const { data, convAtInfo, isActive, isOperated } = this.props
    const { unreadCount } = data
    const itemClasses = classNames(styles.item, {
      active: isActive || isOperated,
      [styles['stick-item']]: data._stick_time
    })

    return (
      <li
        data-convid={data.convid}
        className={itemClasses}
        onContextMenu={this.props.onContextMenu}
        onClick={::this.handleSelect}>
        <Icon type="lianxirenshanchu" className={styles.lianxirenshanchu} title={this.t('delConv')} onClick={::this.removeConv} />
        <MsgAvatar data={data} />
        <div className={styles.info}>
          <p className={styles.name}>
            <span className={classNames({[styles.stick]: data._stick_time})}></span>
            <MsgTime msg_time={data.msg_time} />
            <EntityName data={data} />
          </p>
          <MsgContent data={data} isActive={isActive} convAtInfo={convAtInfo} />
          {unreadCount ? <em className={styles.disturb}>{unreadCount > 99 ? '99+' : unreadCount}</em> : ''}
        </div>
      </li>
    )
  }
}

export default connect(createStructuredSelector({
  convAtInfo: selectors.convAtInfoSelector
}), actions)(MsgItem)
