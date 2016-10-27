import React from 'react'
import { Icon } from 'modules/shared/misc/components'
import styles from './styles'
import Modal from 'modules/shared/misc/components/modal/modal.js'
import Setting from 'modules/setting/components'
import i18n from 'i18n'

export default class extends React.Component {

  render() {
    const { container } = styles
    let settingEntry = (
      <a onClick={::this._handleVisibleChange}>
        <Icon type="settings" className={styles.settings} />
      </a>
    )
    return (
      <div className={container}>
        <Modal
          ref="modal"
          title={i18n.t('setting')}
          entrance={settingEntry}
          noFooter
        >
          <Setting
            onExit={::this._handleVisibleChange}
          />
        </Modal>
      </div>
    )
  }

  _handleVisibleChange() {
    this.refs.modal.handleClose()
  }
}
