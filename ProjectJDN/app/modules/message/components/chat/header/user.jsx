import React from 'react'
import i18n from 'i18n'
import Avatar from 'modules/shared/misc/components/avatar'
import Homepage from 'modules/shared/contacts/components/homepage'
import UserName from 'modules/shared/contacts/components/username'
import AgentName from 'modules/shared/misc/components/agentname'
import Files from 'modules/shared/misc/components/files'
import RecordBox from 'modules/message/components/record'
import { Icon } from 'modules/shared/misc/components'
import * as $h from 'utils/helpers'
import styles from './styles.css'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { selectors as msgSelectors } from 'modules/message'
import { selectors as miscSelectors } from 'modules/shared/misc'

class UserHeader extends React.Component {
  t = i18n.getFixedT(null, 'message')

  render() {
    const { conversation, typingStatus } = this.props
    const { entity, convid } = conversation
    let uri, name, type, linkUrl

    if ($h.isAgent(entity)) {
      // 代理 使用代理头像
      type = 'agent'
      uri = entity.uri
    } else {
      // 用户 使用用户头像
      type = 'user'
      uri = entity.user_id
      name = entity.nick_name
      linkUrl = () => $h.getUserInfoUrl(uri)
    }

    return (
      <div className={styles.header}>
        <div className={styles.info}>
          <span className={styles.img}>
            <Avatar
              uri={uri}
              type={type}
              linkUrl={linkUrl}/>
          </span>
          <span className={styles.name}>
            {name ? <span>{name}</span> : (type === 'agent' ? <AgentName uri={uri} /> : <UserName uid={uri} />)}
            {false ? <Icon type="miandarao" className={styles.maindarao} title={this.t('donotDistrub')} /> : ''}
            {typingStatus ? <span className={styles['in-the-input']}>{this.t('inTheInput')}</span> : ''}
          </span>
        </div>
        <div className={styles.operation}>
          <RecordBox convId={convid} />
          {$h.isAgent(entity) ? null : [
            <Files key="files" type="user" uri={uri} />,
            <Homepage key="homepage" user_id={uri} />
          ]}
        </div>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  typingStatus: msgSelectors.currentConvTypingStatusSelector
}), {})(UserHeader)
