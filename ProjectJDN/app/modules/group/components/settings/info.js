import React from 'react'
import { connect } from 'react-redux'
import i18n from 'i18n'
import auth from 'utils/auth'
import $bus from 'msgbus'
import $cache from 'cache'
import { Icon } from 'modules/shared/misc/components'
import Avatar from 'modules/shared/misc/components/avatar'
import * as actions from '../../actions'
import * as contactsActions from 'modules/shared/contacts/actions'
import { createStructuredSelector } from 'reselect'
import { gInfoSelector, gMembersSelector } from '../../selectors'

import styles from './styles/index.css'

class GInfo extends React.Component {
  static propTypes = {
    gid: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired
  }

  static defaultProps = { }

  constructor(props) {
    super()
    this.state = {
      editHover: false,
      editStatus: false,
      newGName: ''
    }
    this.t = i18n.getFixedT(null, 'group')
    this.userInfo = auth.getAuth()
    this.limit = 100
    this.maxLength = 35
  }

  onMouseEnter() {
    this.setState({
      editHover: true
    })
  }

  onMouseLeave() {
    this.setState({
      editHover: false
    })
  }

  showEditBox() {
    this.setState({
      editStatus: true,
      newGName: this.props.gInfo.gname
    })
  }

  editingGName(e) {
    const value = e.target.value
    this.setState({
      newGName: value
    })
  }

  saveGroupName() {
    if (this.state.newGName !== this.props.gInfo.gname) {
      this.props.saveGroupName({
        gname: this.state.newGName,
        gid: this.props.gid,
        onSuccess: ::this.afterSaveGName
      })
    } else {
      this.setState({
        editStatus: false,
        editHover: false
      })
    }
  }

  afterSaveGName() {
    this.setState({
      editStatus: false,
      editHover: false
    })
    // update cache
    $cache.contacts.group.set(this.props.gid, this.props.gInfo)
    // update state
    $bus.msg.publish('conv.group.update', this.props.gInfo)

    if (this.userInfo) {
      this.props.getGroups({
        uri: this.userInfo.user_id,
        params: {
          $limit: this.limit
        }
      })
    }
    this.props.cleanGroupName()
  }

  render() {
    const gInfo = this.props.gInfo
    const user_grade = this.props.gMembers.user_grade
    return (
      <div className={styles.info}>
        <Avatar type="group" uri={this.props.gid} />
        <div>
          {
            this.state.editStatus ? <div className={styles['eidt-box']} style={{width: this.state.newGName.length >= this.maxLength ? 210 : 250}}>
              <input
                value={this.state.newGName}
                onChange={::this.editingGName} maxLength={this.maxLength}
                style={{width: this.state.newGName.length >= this.maxLength ? 210 : 250}} />
              <button onClick={::this.saveGroupName}>{this.t('settings.confirm')}</button>
            </div> : <div className={styles['view-box']}>
              <span title={gInfo.gname}>{gInfo.gname}</span>
              {
                user_grade > 1 && gInfo.tag !== 4
                ? (
                  this.state.editHover ? <Icon
                    type="qunmingchengbianji"
                    className={styles.qunmingchengbianji}
                    title={this.t('settings.rename')}
                    onMouseLeave={::this.onMouseLeave}
                    onClick={::this.showEditBox} /> : <Icon
                      type="chongmingming"
                      className={styles.chongmingming}
                      title={this.t('settings.rename')}
                      onMouseEnter={::this.onMouseEnter}
                      onClick={::this.showEditBox} />
                ) : ''
              }
            </div>
          }
          {
            this.state.editStatus ? <p style={{color: '#f43531', display: this.state.newGName.length >= this.maxLength ? 'inline-block' : 'none'}}>{this.t('inputMax', {n: this.maxLength})}</p> : ''
          }
          <div className={styles.count}>{this.t('settings.num', {n: gInfo.member_num})}</div>
        </div>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  gInfo: gInfoSelector,
  gMembers: gMembersSelector
}), {...actions, ...contactsActions})(GInfo)
