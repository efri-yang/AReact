import React from 'react'
import $bus from 'msgbus'
import Contacts from './contacts'
import styles from './index.css'

class Messages extends React.Component {
  componentWillUnmount() {
    $bus.msg.publish('convid.set', null)
  }

  render() {
    return (
      <div className={styles.container}>
        <Contacts />
        <div className={styles['chat-container']}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Messages
