import styles from './index.css'
import React, { Component, PropTypes } from 'react'

class CtlMsg extends Component {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired
  }

  render() {
    let {data} = this.props
    return (
      <div className={styles['ctl']}>
        {data}
      </div>
    )
  }
}

export default CtlMsg
