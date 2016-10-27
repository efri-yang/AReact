import styles from './styles/index.css'
import React from 'react'
import i18n from 'i18n'
import { connect } from 'react-redux'
import { isAgent } from 'utils/helpers'
import Left from './left'
import Checked from './checked'
import Modal from 'modules/shared/misc/components/modal/modal'
import * as actions from '../actions'
import * as msgActions from 'modules/message/actions'
import { createStructuredSelector } from 'reselect'
import { recentConversationsSelector } from 'modules/message/selectors'
import { selectors as miscSelectors } from 'modules/shared/misc'

class Contacts extends React.Component {
  static propTypes = {
    mode: React.PropTypes.string,
    entrance: React.PropTypes.element.isRequired,
    handleSubmit: React.PropTypes.func,
    onOpen: React.PropTypes.func,
    recentType: React.PropTypes.string
  }

  static defaultProps = {
    mode: 'single-checked',
    handleSubmit: function () {},
    recentType: 'groupAndUser'
  }

  constructor(props) {
    super()

    this.t = i18n.getFixedT(null, 'contacts')
    this.types = ['recent', 'organization']
  }

  handleClose() {
    this.props.cleanChecked()
  }

  handleSubmit(data) {
    this.refs.contactsModal.handleClose()
    this.props.handleSubmit(data)
  }

  getRecentList() {
    const recentConversations = this.props.recentConversations
    let list = []
    if (this.props.recentType === 'user') {
      for (let i = 0; i < recentConversations.length; i++) {
        if (recentConversations[i].convtype === 0 && !isAgent(recentConversations[i].entity)) {
          list.push({
            uri: recentConversations[i].entity.user_id,
            name: recentConversations[i].entity.nick_name || (recentConversations[i].entity.org_exinfo ? recentConversations[i].entity.org_exinfo.real_name : false) || recentConversations[i].entity.user_name || recentConversations[i].entity.user_id,
            type: 'user'
          })
        }
      }
    } else {
      for (let i = 0; i < recentConversations.length; i++) {
        if (recentConversations[i].convtype === 1) {
          list.push({
            uri: recentConversations[i].entity.gid,
            name: recentConversations[i].entity.gname,
            type: 'group'
          })
        } else if (recentConversations[i].convtype === 0 && !isAgent(recentConversations[i].entity)) {
          list.push({
            uri: recentConversations[i].entity.user_id,
            name: recentConversations[i].entity.nick_name || (recentConversations[i].entity.org_exinfo ? recentConversations[i].entity.org_exinfo.real_name : false) || recentConversations[i].entity.user_name || recentConversations[i].entity.user_id,
            type: 'user'
          })
        }
      }
    }
    return list
  }

  render() {
    const types = this.types
    const { mode, recentType } = this.props
    const recentList = this.getRecentList()
    let searchTypes = ['user', 'group', 'organization']
    if (recentType === 'user') {
      searchTypes = ['user', 'organization']
    }

    return (
      <Modal
        ref="contactsModal"
        title={this.t('addMember')}
        width={620}
        footer={null}
        entrance={this.props.entrance}
        handleOpen={this.props.onOpen}
        handleClose={::this.handleClose}>
        <div className={styles['contacts-area']}>
          <div className={styles['contacts-body']}>
            <div className={styles['contacts-left']}>
              <Left
                types={types}
                mode={mode}
                searchHeight={440}
                searchTypes={searchTypes}
                recentList={recentList} />
            </div>
            <div className={styles['contacts-right']}>
              <Checked
                mode={mode}
                handleSubmit={::this.handleSubmit} />
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  recentConversations: recentConversationsSelector
}), {...actions, ...msgActions})(Contacts)
