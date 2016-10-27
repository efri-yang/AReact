import React from 'react'
import classNames from 'classnames'
import { Icon } from 'modules/shared/misc/components'
import styles from './styles/index.css'

class Dock extends React.Component {

  state = {
    isVisible: false,
    isLeaving: false
  }

  handleOpen() {
    this.setState({
      isVisible: true
    })
    this.props.handleOpen()
  }

  handleClose() {
    this._animateBeforeClose()

    setTimeout(() => {
      this.props.handleClose()
      this.setState({
        isVisible: false,
        isLeaving: false
      })
    }, 300)
  }

  _animateBeforeClose() {
    this.setState({
      isLeaving: true
    })
  }

  render() {
    const { isVisible, isLeaving } = this.state
    const dockClasses = classNames(styles.dock, {open: isVisible, hide: !isVisible})
    const shadowClasses = classNames(styles.shadow, {
      [styles.shadowEnter]: isVisible,
      [styles.shadowLeave]: isLeaving
    })
    const containerClasses = classNames(styles.container, {
      [styles.containerEnter]: isVisible,
      [styles.containerLeave]: isLeaving
    })

    return (
      <div>
        <div className={dockClasses}>
          <div className={shadowClasses} onClick={::this.handleClose}>
          </div>
          <div className={containerClasses}>
            <div className={styles.header}>{this.props.title}<Icon type="guanbi" className={styles.guanbi} onClick={::this.handleClose} /></div>
            {this.props.children}
          </div>
        </div>
        <span onClick={::this.handleOpen}>{this.props.entrance}</span>
      </div>
    )
  }
}

export default Dock
