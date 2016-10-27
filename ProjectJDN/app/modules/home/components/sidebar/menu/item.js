import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { selectors } from 'modules/message'
import { selectors as miscSelectors } from 'modules/shared/misc'
import { Icon } from 'modules/shared/misc/components'
import i18n from 'i18n'
import styles from './styles'

class MenuItem extends React.Component {
  render() {
    const { iconc, text } = styles
    const { data: { icon, key }, totalUnread } = this.props

    return (
      <span>
        <Icon type={icon} className={iconc} data-type={icon}/>
        <span className={text}>{i18n.t(`sidebar.${key}`)}</span>
        {key === 'msg' && totalUnread ? <em className={styles.unread}>{totalUnread > 99 ? '99+' : totalUnread}</em> : null}
      </span>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  totalUnread: selectors.totalUnreadSelector
}))(MenuItem)
