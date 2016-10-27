import React, { PropTypes } from 'react'
import cx from 'classnames'
import Icon from '../icon'
import styles from './styles'

class Message extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    message: PropTypes.string
  }

  render() {
    const { type, message } = this.props
    const classes = cx(styles.msg, {
      [styles[type]]: styles[type]
    })
    return (
      <div className={classes}>
        <Icon type={type} className={styles.icon}/>
        {message}
      </div>
    )
  }
}

let msg = {
  notification: undefined
}

msg.add = function (notice) {
  return this.notification.add(notice)
}

msg.remove = function (id) {
  return this.notification.remove(id)
}

msg.clearAll = function () {
  return this.notification.clear()
}

;['success', 'error', 'warn', 'info', 'loading'].forEach(type => {
  msg[type] = function (message) {
    return this.add({
      single: true,
      autoHide: type !== 'loading',
      Component: <Message type={type} message={message}/>
    })
  }
})

export default msg
