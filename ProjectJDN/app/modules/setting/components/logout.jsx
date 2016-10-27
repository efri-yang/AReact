import styles from './index.css'
import { Icon } from 'modules/shared/misc/components'
import Link from 'react-router/lib/Link'
import i18n from 'i18n'
import React, { Component, PropTypes } from 'react'

const __ = i18n.getFixedT(null, 'setting')

class Logout extends Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired
  }

  render() {
    return (
      <div className={styles['modal-content']}>
        <div className={styles['logout-warn']}>
          <Icon type="triangleWarn"/>
          <p>{__('logoutWarn', {'app_name': __('app.name')})}</p>
        </div>
        <div className={styles['modal-btns']}>
          <Link to={'/logout'}>
            <button className={styles['confirm']} onClick={::this._handleCancel}>
              {__('logoutConfrimAgain')}
            </button>
          </Link>
          <button onClick={::this._handleCancel} className={styles['cancel']}>
            {__('cancel')}
          </button>
        </div>
      </div>
    )
  }

  _handleCancel() {
    this.props.onCancel()
  }
}

export default Logout
