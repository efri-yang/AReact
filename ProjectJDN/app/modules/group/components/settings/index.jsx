import React from 'react'
import { connect } from 'react-redux'
import Dock from 'modules/shared/misc/components/modal/dock'
import i18n from 'i18n'
import auth from 'utils/auth'
import { Icon } from 'modules/shared/misc/components'
import GBody from './body'
import * as actions from '../../actions'
import * as contactsActions from 'modules/shared/contacts/actions'
import { createStructuredSelector } from 'reselect'
import { selectors as miscSelectors } from 'modules/shared/misc'
import { gInfoSelector } from '../../selectors'

import styles from './styles/index.css'

class GSetting extends React.Component {
  static propTypes = {
    gid: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired,
    handleQuitTheGroup: React.PropTypes.func
  }

  static defaultProps = {
    handleQuitTheGroup: function () {}
  }

  constructor(props) {
    super()
    this.state = { }
    this.isVisible = false
    this.t = i18n.getFixedT(null, 'group')

    this.userInfo = auth.getAuth()
    this.limit = 100
  }

  handleClose() {
    this.props.cleanGroupMembers()
    this.isVisible = false
  }

  handleOpen() {
    this.initPage()
    if (this.refs.gBody) {
      const GBodyComponent = this.refs.gBody.getWrappedInstance()
      GBodyComponent.changeDelStatus(false)
    }
    this.isVisible = true
  }

  initPage() {
    if (this.userInfo) {
      this.props.getGroupInfo({
        gid: this.props.gid
      })
      this.props.getGroupMembers({
        user_id: this.userInfo.user_id,
        gid: this.props.gid,
        limit: this.limit
      })
    }
  }

  render() {
    const gInfo = this.props.gInfo

    return (
      <div>
        <Dock
          entrance={<Icon type="qunshezhi" className={styles.qunshezhi} title={this.t('settings.title')}/>}
          title={this.t('settings.title')}
          handleOpen={::this.handleOpen}
          handleClose={::this.handleClose}>
          {
            gInfo ? <GBody
              ref="gBody"
              gid={this.props.gid}
              handleClose={::this.handleClose} /> : null
          }
        </Dock>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  gInfo: gInfoSelector
}), {...actions, ...contactsActions})(GSetting)
