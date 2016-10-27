import 'rc-switch/assets/index.css'
import styles from './index.css'
import * as actions from '../actions'
import {connect} from 'react-redux'
import React, { Component, PropTypes } from 'react'
import i18n from 'i18n'
import Switch from 'rc-switch'
import Radio from './radio.jsx'
import Logout from './logout.jsx'
import Modal from 'modules/shared/misc/components/modal/modal.js'
import LangSelect from 'modules/shared/misc/components/langSelect'
import storage from 'utils/storage'
import {SETTINGKEY} from 'constants'
const __ = i18n.getFixedT(null, 'setting')

class Setting extends Component {
  static propTypes = {
    onExit: PropTypes.func.isRequired
  }

  componentDidMount() {
    let savedSetting = storage.get(SETTINGKEY)
    savedSetting && this.props.changeSetting(savedSetting)
  }

  render() {
    const {desktopNoticeOn, promptToneOn, shortcutCtrl} = this.props.setting
    let checkedChildren = (
      <span>{__('on')}</span>
    )
    let unCheckedChildren = (
      <span>{__('off')}</span>
    )

    let logoutEntry = (
      <div className={styles['modal-btns']}>
        <button className={styles['logout']}>
          {__('logout')}
        </button>
      </div>
    )

    return (
      <div className={styles['modal-content']}>
        <div>
          <div className={styles['setting-item']}>
            <div className="pure-u-3-8">{__('desktopNotice')}</div>
            <div className="pure-u-5-8">
              <Switch
                checked={desktopNoticeOn}
                checkedChildren={checkedChildren}
                unCheckedChildren={unCheckedChildren}
                onChange={this._handlerSettingChange.bind(this, 'desktopNoticeOn')}
                disabled
              />
            </div>
          </div>
          <div className={styles['setting-item']}>
            <div className="pure-u-3-8">{__('promptTone')}</div>
            <div className="pure-u-5-8">
              <Switch
                checked={promptToneOn}
                checkedChildren={checkedChildren}
                unCheckedChildren={unCheckedChildren}
                onChange={this._handlerSettingChange.bind(this, 'promptToneOn')}
                disabled
              />
            </div>
          </div>
          <div className={styles['setting-item']}>
            <div className="pure-u-3-8">{__('changeLanguage')}</div>
            <div className="pure-u-5-8">
              <LangSelect width={115}/>
            </div>
          </div>
          <div className={styles['setting-item']}>
            <div className="pure-u-3-8">{__('sendMsgShortcuts')}</div>
            <div className={styles['radios'] + ' pure-u-5-8'}>
              <div>
                <Radio
                  checked={shortcutCtrl}
                  label={__('pressToSend', {shortcuts: 'Ctrl+Enter'})}
                  onChange={this._handlerSettingChange.bind(this, 'shortcutCtrl')}/>
              </div>
              <div>
                <Radio
                  label={__('pressToSend', {shortcuts: 'Enter'})}
                  checked={!shortcutCtrl}
                  onChange={this._handlerSettingChange.bind(this, 'shortcutCtrl')}/>
              </div>
            </div>
          </div>
        </div>
        <Modal
          ref="modal"
          animation={undefined}
          entrance={logoutEntry}
          title={__('logoutConfrim')}
          noFooter>
          <Logout onCancel={::this._handleLogoutCancel} />
        </Modal>
      </div>
    )
  }

  _handlerSettingChange(key) {
    let newSetting = {...this.props.setting}
    newSetting[key] = !this.props.setting[key]
    this.props.changeSetting(newSetting)
  }

  _handleLogoutCancel() {
    this.refs.modal.handleClose()
  }
}

export default connect(state => ({
  setting: state.setting
}), actions)(Setting)
