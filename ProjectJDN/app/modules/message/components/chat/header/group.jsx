import React from 'react'
import { connect } from 'react-redux'
import i18n from 'i18n'
import Avatar from 'modules/shared/misc/components/avatar'
import Files from 'modules/shared/misc/components/files'
import Notice from 'modules/group/components/notice'
import GSettings from 'modules/group/components/settings'
import RecordBox from 'modules/message/components/record'
import { actions } from 'modules/message'
import { Icon } from 'modules/shared/misc/components'
import styles from './styles.css'
import { createStructuredSelector } from 'reselect'
import { selectors as miscSelectors } from 'modules/shared/misc'

class GroupHeader extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  t = i18n.getFixedT(null, 'message')

  handleQuitTheGroup() {
    this.props.removeConversations(this.props.conversation.convid)
    if (this.context.router.isActive('/msg/chat')) {
      this.context.router.replace('/msg')
    } else {
      this.context.router.replace('/contacts')
    }
  }

  render() {
    const { conversation } = this.props
    const { entity: {gid, gname}, convid } = conversation

    return (
      <div className={styles.header}>
        <div className={styles.info}>
          <span className={styles.img}>
            <Avatar uri={gid} type="group"/>
          </span>
          <span className={styles.name}>
            <span>{gname}</span>
            {false ? <Icon type="miandarao" className={styles.maindarao} title={this.t('donotDistrub')} /> : ''}
          </span>
        </div>
        <div className={styles.operation}>
          <Notice gid={gid} />
          <RecordBox convId={convid} />
          <Files type="group" uri={gid} />
          <GSettings gid={gid} handleQuitTheGroup={::this.handleQuitTheGroup} />
        </div>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector
}), actions)(GroupHeader)
