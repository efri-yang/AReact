import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import Icon from 'modules/shared/misc/components/icon.js'
import i18n from 'i18n'
import {MSG_TYPE} from 'constants'

class NotSupport extends Component {
  constructor(props) {
    super()
    this.t = i18n.getFixedT(null, 'message')
    const {type} = props
    this.text = ''
    if (type === MSG_TYPE.VIDEO) {
      this.text = this.t('videoNotSupport')
    } else {
      this.text = this.t('not-support')
    }
  }

  static propTypes = {
    type: PropTypes.string
  }

  render() {
    return (
      <div className={styles['not']}>
        <Icon type="warn" />
        <span>{this.text}</span>
      </div>
    )
  }
}

export default NotSupport
