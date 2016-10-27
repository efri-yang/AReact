import React, { Component } from 'react'
import cx from 'classnames'
import styles from './styles.css'

class NotificationItem extends Component {
  constructor() {
    super()
    this.animationDuration = 500
  }

  componentDidMount() {
    const { notice } = this.props
    const { duration, autoHide } = notice
    const self = this
    if (autoHide) {
      this.leaveTimer = setTimeout(() => {
        self.leave()
      }, duration + this.animationDuration)
    }
  }

  componentWillUnmount() {
    this.leaveTimer && clearTimeout(this.leaveTimer)
  }

  render() {
    const { notice } = this.props
    const classes = cx(styles['notice-container'], {
      [styles.enterAnimation]: !notice.noAnimation
    })

    return (
      <div style={{overflow: 'hidden'}}>
        <div ref="container" className={classes}>
          {notice.Component}
        </div>
      </div>
    )
  }

  leave() {
    this.refs.container.className += styles.leaveAnimation
    setTimeout(::this._remove, this.animationDuration)
  }

  _remove() {
    this.props.onLeave(this.props.notice.id)
  }
}

export default NotificationItem
