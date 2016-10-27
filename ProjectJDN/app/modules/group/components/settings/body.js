import React from 'react'
import { connect } from 'react-redux'
import i18n from 'i18n'
import auth from 'utils/auth'
import Confirm from 'modules/shared/misc/components/modal/confirm'
import Avatar from 'modules/shared/misc/components/avatar'
import Contact from 'modules/shared/contacts/components'
import GInfo from './info'
import Msg from 'modules/shared/misc/components/message'
import { Scrollbars } from 'react-custom-scrollbars'
import * as actions from '../../actions'
import * as contactsActions from 'modules/shared/contacts/actions'
import { createStructuredSelector } from 'reselect'
import { selectors as miscSelectors } from 'modules/shared/misc'
import { gInfoSelector, gMembersSelector } from '../../selectors'
import * as $h from 'utils/helpers'

import styles from './styles/index.css'

class Gbody extends React.Component {
  static propTypes = {
    gid: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired,
    handleQuitTheGroup: React.PropTypes.func
  }

  static defaultProps = {
    handleQuitTheGroup: function () {}
  }

  constructor(props) {
    super()
    this.state = {
      delStatus: false
    }
    this.t = i18n.getFixedT(null, 'group')
    this.userInfo = auth.getAuth()
    this.limit = 100
    this.existNames = null
  }

  changeDelStatus(value) {
    this.setState({
      delStatus: value
    })
  }

  isMemberExist(uri) {
    const gMembers = this.props.gMembers.members
    for (let j = 0; j < gMembers.length; j++) {
      if (uri === gMembers[j].uri) {
        return gMembers[j].uri_name
      }
    }
    return null
  }

  filterMembers(users) {
    const existNames = []
    const uris = []
    for (let i = 0; i < users.length; i++) {
      const uri = users[i].uri
      let isExit = this.isMemberExist(uri)
      if (isExit !== null) {
        existNames.push(isExit)
      } else {
        uris.push(uri)
      }
    }
    return {
      uris: uris,
      existNames: existNames
    }
  }

  handleSubmit(data) {
    const users = data.users
    let { uris, existNames } = this.filterMembers(users)
    this.existNames = existNames.length > 0 ? existNames.join(this.t('comma')) : null
    if (uris.length > 0) {
      this.props.addMembers({
        uris: uris,
        gid: this.props.gid,
        onSuccess: ::this.msgExistNames
      })
    } else {
      this.msgExistNames()
    }
  }

  msgExistNames() {
    this.existNames && Msg.warn(this.t('inGroup', {names: this.existNames}))
  }

  handleDel(data) {
    this.props.delMember({
      uri: data.uri,
      gid: this.props.gid
    })
  }

  handleQuit() {
    const user_grade = this.props.gMembers.user_grade
    if (user_grade === 3) {
      this.props.dissolveTheGroup({
        gid: this.props.gid,
        onSuccess: ::this.afterQuit
      })
    } else {
      this.props.quitTheGroup({
        uri: this.userInfo.user_id,
        gid: this.props.gid,
        onSuccess: ::this.afterQuit
      })
    }
  }

  afterQuit() {
    this.props.handleClose()
    if (this.userInfo) {
      this.props.getGroups({
        uri: this.userInfo.user_id,
        params: {
          $limit: this.limit
        }
      })
    }
    this.props.handleQuitTheGroup()
  }

  allMembersIsAdmin(gMembers) {
    for (let i = 0; i < gMembers.length; i++) {
      if (gMembers[i].grade === 1) {
        return false
      }
    }
    return true
  }

  getUserRight(gInfo, gMembers, user_grade) {
    const allAdmin = this.allMembersIsAdmin(gMembers)
    const notOnlyManager = user_grade === 3 && gMembers.length > 1
    const adminAndMember = user_grade === 2 && !allAdmin
    return {
      add: gInfo.invite_policy === 1 || (gInfo.invite_policy === 0 && user_grade > 1),
      del: notOnlyManager || adminAndMember
    }
  }

  render() {
    const that = this
    const gInfo = that.props.gInfo
    const gMembers = that.props.gMembers.members
    const user_grade = that.props.gMembers.user_grade

    const userRight = gInfo ? that.getUserRight(gInfo, gMembers, user_grade) : null

    return (
      <div className={styles.settings}>
        <div className={styles.body} id="qunshezhi">
          <GInfo gid={that.props.gid} />

          <div className={styles.members}>
            {
              gMembers.length > 0 ? <Scrollbars>
                <div className={styles['members-box']}>
                  {
                    userRight.add ? <Contact
                      mode="multi-checked"
                      entrance={<div className={styles.add}><span></span><span></span></div>}
                      handleSubmit={::that.handleSubmit}
                      recentType="user" /> : ''
                  }
                  {
                    userRight.del ? <div className={styles.del} onClick={that.changeDelStatus.bind(that, !that.state.delStatus)}><span></span></div> : ''
                  }
                  {
                    gMembers.map(function (item, key) {
                      const managerDelOther = user_grade === 3 && item.grade !== 3
                      const adminDelMember = user_grade === 2 && item.grade === 1
                      const canDel = managerDelOther || adminDelMember
                      return (
                        <div className={styles.member} key={key}>
                          {
                            that.state.delStatus && canDel ? <Confirm
                              animation={undefined}
                              title={that.t('confirmDel')}
                              entrance={<span className={styles['del-member']}><span></span></span>}
                              parentId="qunshezhi"
                              handleOk={that.handleDel.bind(that, item)}>
                              <p>{that.t('settings.sureDel', {name: item.uri_name})}</p>
                            </Confirm> : ''
                          }
                          <span className={styles['img-box']}><Avatar uri={item.uri} linkUrl={() => $h.getUserInfoUrl(item.uri)}/></span>
                          <p title={item.uri_name}>{item.uri_name}</p>
                        </div>
                      )
                    })
                  }
                </div>
              </Scrollbars> : <p className={styles.loading}>{that.t('loading')}</p>
            }
          </div>
        </div>
        <div className={styles.footer}>
          {
            that.state.delStatus ? <button onClick={that.changeDelStatus.bind(that, !that.state.delStatus)}>{that.t('confirm')}</button> : (gInfo.owner_uri === String(that.userInfo.user_id) ? <Confirm
              animation={undefined}
              title={that.t('settings.delAndQuitTitle')}
              entrance={<button>{that.t('settings.delAndQuit')}</button>}
              parentId="qunshezhi"
              handleOk={::that.handleQuit}>
              <p>{that.t('settings.sureDelAndQuit')}</p>
            </Confirm> : <Confirm
              animation={undefined}
              title={that.t('settings.quitTitle')}
              entrance={<button>{that.t('settings.quit')}</button>}
              parentId="qunshezhi"
              handleOk={::that.handleQuit}>
              <p>{that.t('settings.sureQuit')}</p>
            </Confirm>)
          }
        </div>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  gInfo: gInfoSelector,
  gMembers: gMembersSelector
}), {...actions, ...contactsActions}, null, {withRef: true})(Gbody)
