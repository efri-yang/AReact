import React from 'react'
import { connect } from 'react-redux'
import i18n from 'i18n'
import auth from 'utils/auth'
import * as URL from 'constants/url'
import { replaceAuthInfo } from 'utils/helpers'
import StrSplit from 'utils/strSplit'
import Confirm from 'modules/shared/misc/components/modal/confirm'
import Modal from 'modules/shared/misc/components/modal/modal'
import { Icon } from 'modules/shared/misc/components'
import Avatar from 'modules/shared/misc/components/avatar'
import Username from 'modules/shared/contacts/components/username'
import * as actions from '../../actions'
import { createStructuredSelector } from 'reselect'
import { selectors as miscSelectors } from 'modules/shared/misc'
import { uSignatureSelector, isFriendSelector } from '../../selectors'
import styles from './styles/index.css'

class Homepage extends React.Component {
  static propTypes = {
    user_id: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired,
    user_name: React.PropTypes.string
  }

  static defaultProps = {
    user_name: ''
  }

  constructor() {
    super()
    this.link_url = URL.INFO + '/Default.aspx?sid=#uckey#&userid=#frd_workid#&ToUrl=D3DD0CA6B2511FF2790861FEB6B8E888D17BC7D14B9D101C387E6E7C554795D5'
    this.t = i18n.getFixedT(null, 'contacts')
    this.limit = 200
    this.userInfo = auth.getAuth()
  }

  handleOpen() {
    this.props.getUserSignature({
      user_id: this.props.user_id
    })
    if (this.userInfo) {
      this.props.isFriend({
        uri: this.props.user_id
      })
    }
  }

  handleClose() {
    this.props.cleanUserSignature()
  }

  editFriend() {
    if (this.userInfo) {
      if (this.props.isF) {
        this.props.delFriend({
          uri: this.props.user_id,
          onSuccess: ::this.afterEditFriend
        })
      } else {
        this.props.addFriend({
          org_id: this.userInfo.org_exinfo.org_id,
          policy: 'friend_without_approval',
          uri: this.props.user_id,
          onSuccess: ::this.afterEditFriend
        })
      }
    }
  }

  afterEditFriend(data) {
    this.props.isFriend({
      uri: this.props.user_id
    })
    this.props.getFriendsOfGroup({
      tag_id: 0,
      $limit: this.limit
    })
  }

  sendMsg() {
    this.refs.modal.handleClose()
  }

  _handleJump() {
    let addr = this.link_url
    addr = addr.replace('#frd_workid#', this.props.user_id)
    const link = replaceAuthInfo(addr)
    console.log(link)
    window.open(link)
  }

  _handleJumpWeibo() {
    window.open(URL.WEIBO + this.props.user_id)
  }

  render() {
    return (
      <Modal
        ref="modal"
        width={500}
        title={this.t('homepage.title')}
        footer={[
          this.props.isF ? <button key="edit" className={styles['host-btn']}>
            <Confirm
              animation={undefined}
              title={this.t('confirmDel')}
              entrance={<span>{this.t('homepage.delFriend')}</span>}
              handleOk={::this.editFriend}>
              <p>{this.t('homepage.sureDel')}</p>
            </Confirm>
          </button> : <button key="edit" className={styles['host-btn']} onClick={::this.editFriend}>{this.props.isF ? this.t('homepage.delFriend') : this.t('homepage.addFriend')}</button>,
          <button key="send" className={styles['host-btn']} onClick={::this.sendMsg}>{this.t('homepage.sendMsg')}</button>
        ]}
        entrance={<Icon type="gerenzhuye" className={styles.gerenzhuye} title={this.t('homepage.title')} />}
        handleOpen={::this.handleOpen}>
        <div className={styles['host-area']}>
          <div className={styles['body']}>
            <div className={styles['personal']}>
              <div className={styles['photo']}>
                <Avatar
                  uri={this.props.user_id}
                  width="60"
                  height="60"/>
              </div>
              <div className={styles['info']}>
                <p>{
                  this.props.user_name ? this.props.user_name : <Username uid={this.props.user_id} type="real" />
                }</p>
                <p title={this.props.signature.s}>{StrSplit.clamp(this.props.signature.s, 60)}</p>
              </div>
            </div>
            <ul>
              <li onClick={::this._handleJump}><Icon type="gerenziliao" className={styles['host-icon-datum']} />{this.t('homepage.info')}<span><span className={styles['host-icon-view']}></span></span></li>
              <li onClick={::this._handleJumpWeibo}><Icon type="weibodongtai" className={styles['host-icon-ring']} />{this.t('homepage.weibo')}<span><span className={styles['host-icon-view']}></span></span></li>
              {
                false && <li><Icon type="xiangcejijin" className={styles['host-icon-photo']} />{this.t('homepage.album')}<span><span className={styles['host-icon-view']}></span></span></li>
              }
            </ul>
          </div>
        </div>
      </Modal>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  signature: uSignatureSelector,
  isF: isFriendSelector
}), actions)(Homepage)
