import React from 'react'
import { isAgent } from 'utils/helpers'
import Avatar from 'modules/shared/misc/components/avatar'
import { constants as C } from 'modules/message'

import styles from '../styles'

class MsgAvatar extends React.Component {

  render() {
    const { data } = this.props
    const { entity } = data
    let avatarNode
    switch (data.convtype) {
      case C.CONVTYPE.P2P:
        avatarNode = <Avatar
          uri={entity.uri || entity.user_id}
          type={isAgent(entity) ? 'agent' : 'user'}
          className={styles.avatar}/>
        break
      case C.CONVTYPE.GRP:
        avatarNode = <Avatar uri={entity.gid} type="group" className={styles.avatar}/>
        break
      default:
        avatarNode = <Avatar
          uri={entity.uri}
          className={styles.avatar}/>
    }
    return <span className={styles['img-box']}>{avatarNode}</span>
  }
}

export default MsgAvatar
