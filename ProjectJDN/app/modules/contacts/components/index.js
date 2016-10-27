import React from 'react'
import Contacts from 'modules/shared/contacts/components/left'
import $bus from 'msgbus'
import styles from './styles/index.css'

class ContactsPage extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  componentWillUnmount() {
    $bus.msg.publish('convid.set', null)
  }

  handleSelect(item) {
    const self = this

    const cb = data => {
      $bus.msg.publish('convid.set', data.convid)

      if (!self.context.router.isActive('/contacts/chat')) {
        self.context.router.replace('/contacts/chat')
      }
    }

    if (item.type === 'group') {
      const data = item.data.group_info || item.data
      $bus.msg.publish('conv.group.update', data)
      cb(data)
    } else {
      $bus.msg.publish('conv.p2p.update', {
        uri: item.data.uri || item.data.user_id,
        onSuccess(payload) {
          const data = payload.conversations[0].data.items[0]
          cb(data)
        }
      })
    }
  }

  render() {
    return (
      <div className={styles['contacts-container']}>
        <div className={styles['left']}>
          <Contacts
            types={['friends', 'group', 'organization']}
            handleSelect={::this.handleSelect}/>
        </div>
        <div className={styles['right']}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default ContactsPage
