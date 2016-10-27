import React from 'react'
import { connect } from 'react-redux'
import Dock from 'modules/shared/misc/components/modal/dock'
import Empty from 'modules/shared/misc/components/modal/empty'
import i18n from 'i18n'
import { createStructuredSelector } from 'reselect'
import { Scrollbars } from 'react-custom-scrollbars'
import auth from 'utils/auth'
import { Icon } from 'modules/shared/misc/components'
import { selectors as miscSelectors } from 'modules/shared/misc'
import * as actions from '../../actions'
import styles from './styles/index.css'

class Notice extends React.Component {
  static propTypes = {
    gid: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired
  }

  static defaultProps = { }

  constructor(props) {
    super()
    this.state = {
      type: 'view',
      notice: '',
      oldnotice: '',
      userGrade: 1
    }
    this.isVisible = false
    this.t = i18n.getFixedT(null, 'group')
    this.userInfo = auth.getAuth()
    this.maxLength = 255
  }

  handleOpen() {
    this.props.getGroupNotices({
      gid: this.props.gid,
      onSuccess: ::this.afterGetGNotices
    })
    if (this.userInfo) {
      this.props.getGUserInfo({
        gid: this.props.gid,
        uri: this.userInfo.user_id,
        onSuccess: ::this.afterGetGUserInfo
      })
    }
    this.setState({
      type: 'view',
      notice: ''
    })
    this.isVisible = true
  }

  handleClose() {
    this.setState({
      oldnotice: ''
    })
    this.isVisible = false
  }

  afterGetGNotices(data) {
    if (this.isVisible) {
      this.setState({
        oldnotice: data.items.length > 0 ? data.items[0].content : ''
      })
    }
  }

  afterGetGUserInfo(data) {
    if (this.isVisible) {
      this.setState({
        userGrade: data.grade
      })
    }
  }

  editNotice() {
    this.setState({
      type: 'mod',
      notice: this.state.oldnotice
    })
  }

  cancleEditNotice() {
    this.setState({
      type: 'view',
      notice: ''
    })
  }

  editingNotice(e) {
    const value = e.target.value
    this.setState({
      notice: value
    })
  }

  sureEditNotice() {
    if (this.state.notice !== this.state.oldnotice) {
      this.props.editGroupNotice({
        gid: this.props.gid,
        content: this.state.notice,
        onSuccess: ::this.afterEditGNotice
      })
    } else {
      this.afterEditGNotice()
    }
  }

  afterEditGNotice() {
    if (this.isVisible) {
      /*this.setState({
        type: 'view',
        notice: '',
        oldnotice: this.state.notice
      })*/
      this.refs.dockNotice.handleClose()
    }
  }

  render() {
    return (
      <div>
        <Dock
          ref="dockNotice"
          entrance={<Icon type="qungonggao" className={styles.qungonggao} title={this.t('notice.title')} />}
          title={this.t('notice.title')}
          handleOpen={::this.handleOpen}
          handleClose={::this.handleClose}>
          {
            this.state.type === 'view' ? <div className={styles['view']}>
              {
                this.state.oldnotice ? <div className={styles['text']}>
                  <Scrollbars>
                    <p dangerouslySetInnerHTML={{__html: this.state.oldnotice.replace(/\n/g, '<br />')}}></p>
                  </Scrollbars>
                </div> : <Empty className={styles['text']} tip={this.t('notice.empty')} />
              }
              {
                this.state.userGrade > 1 ? <div className={styles['btn-box']}>
                  <button onClick={::this.editNotice}>{this.t('notice.edit')}</button>
                </div> : ''
              }
            </div> : <div className={styles['mod']}>
              <div className={styles['mod-inner']}>
                <textarea value={this.state.notice} onChange={::this.editingNotice} maxLength={this.maxLength}></textarea>
              </div>
              <p style={{display: this.state.notice.length >= this.maxLength ? 'block' : 'none'}}>{this.t('inputMax', {n: this.maxLength})}</p>
              <div className={styles['btn-box']}>
                <button onClick={::this.cancleEditNotice}>{this.t('cancel')}</button>
                <button onClick={::this.sureEditNotice}>{this.t('confirm')}</button>
              </div>
            </div>
          }
        </Dock>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector
}), actions)(Notice)
