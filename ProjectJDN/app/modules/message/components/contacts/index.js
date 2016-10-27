import React from 'react'
import { connect } from 'react-redux'
import { Scrollbars } from 'react-custom-scrollbars'
import { actions } from 'modules/message'
import Search from 'modules/shared/misc/components/search'
import List from './list'
import $cache from 'cache'
import $bus from 'msgbus'

import styles from './styles'

class Contacts extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles['search-box']}>
          <Search
            width={275}
            height={517}
            inputPadding={[11, 12, 11, 12]}
            onSelect={::this.handleSearch}/>
        </div>
        <div className={styles['contacts-box']}>
          <Scrollbars
            className={styles.scrollbar}
            ref="scrollbars"
            renderView={props => <div {...props} id="contacts-wrapper"/>}
            renderThumbVertical={props => <div {...props} data-role="thumb"/>}>
            <List />
          </Scrollbars>
        </div>
      </div>
    )
  }

  handleSearch(item) {
    const self = this

    const cb = data => {
      setTimeout(() => {
        $bus.msg.publish('convid.set', data.convid)

        if (!self.context.router.isActive('/msg/chat')) {
          self.context.router.replace('/msg/chat')
        }
      }, 200)
    }

    if (item.object_type === 'group') {
      const { group_info } = item
      this.props.addOrUpdateGroupConversation(group_info)
      cb(group_info)
    } else if (item.object_type === 'user') {
      this.props.addP2PConversation({
        uri: item.uri || item.user_id,
        onSuccess(payload) {
          const data = payload.conversations[0].data.items[0]
          cb(data)
        }
      })
    } else {
      $cache.expandOrg.set(item)
      self.context.router.replace('/contacts')
    }
  }
}

export default connect(null, actions)(Contacts)
