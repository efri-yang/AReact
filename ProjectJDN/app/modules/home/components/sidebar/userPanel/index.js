import React from 'react'
import { connect } from 'react-redux'
import Avatar from 'modules/shared/misc/components/avatar'
import { createStructuredSelector } from 'reselect'
import { selectors } from 'modules/account'
import * as $h from 'utils/helpers'

import styles from './styles'

class UserPanel extends React.Component {
  render() {
    const { user } = this.props
    const { container, avatar, name } = styles

    return (
      <div className={container}>
        <Avatar
          uri={user.user_id}
          className={avatar}
          width="60"
          height="60"
          linkUrl={() => $h.getUserInfoUrl(user.user_id)} />
        <div className={name} title={user.nick_name}>{user.nick_name}</div>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  user: selectors.userSelector
}))(UserPanel)
