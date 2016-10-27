import React from 'react'
import { isAgent } from 'utils/helpers'
import UserName from 'modules/shared/contacts/components/username'
import AgentName from 'modules/shared/misc/components/agentname'
import { constants as C } from 'modules/message'

import styles from '../styles'

class EntityName extends React.Component {
  render() {
    const { data } = this.props
    const { entity } = data
    return <span className={styles.title}>{
      data.convtype === C.CONVTYPE.P2P ? (
        isAgent(entity)
          ? <AgentName className={styles.title} uri={entity.uri} needTitle="true" />
          : <UserName className={styles.title} uid={entity.user_id} needTitle="true"/>
      )
        : (
        data.convtype === C.CONVTYPE.GRP
          ? <span title={entity.gname}>{entity.gname}</span>
          : this.t('meeting')
      )
    }</span>
  }
}

export default EntityName
