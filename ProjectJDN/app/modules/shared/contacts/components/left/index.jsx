import React from 'react'
import { connect } from 'react-redux'
import ContactsTab from '../tab'
import Search from '../../../misc/components/search'
import * as actions from '../../actions'
import { createStructuredSelector } from 'reselect'
import { uCheckedSelector, usCheckedSelector } from '../../selectors'
import styles from './styles/index.css'

class Left extends React.Component {
  constructor() {
    super()
    this.state = {
      searching: false
    }
  }

  static propTypes = {
    types: React.PropTypes.array,
    mode: React.PropTypes.string, // single-checked(单选用户或群)，multi-checked(多选用户或群)，select(点击，默认)
    handleSelect: React.PropTypes.func,
    searchTypes: React.PropTypes.array,
    searchHeight: React.PropTypes.number,
    recentList: React.PropTypes.array
  }

  static defaultProps = {
    types: ['friends', 'group', 'organization'],
    mode: 'select',
    handleSelect: function () {},
    searchTypes: ['user', 'group', 'organization'],
    searchHeight: 517,
    recentList: []
  }

  onCheckUserBySearch(data) {
    const { mode } = this.props
    switch (mode) {
      case 'single-checked':
        this.props.checkUser({
          uri: this.props.userChecked.type === 'user' && String(data.user_id) === this.props.userChecked.uri ? '' : String(data.user_id),
          name: data.nick_name,
          type: 'user'
        })
        break
      case 'multi-checked':
        this.props.checkUsers({
          data: {
            uri: String(data.user_id),
            name: data.nick_name,
            type: 'user'
          },
          users: this.props.usersChecked.users,
          groups: this.props.usersChecked.groups,
          type: 'user'
        })
        break
      default:
        this.props.handleSelect({
          data: data,
          type: 'user'
        })
        break
    }
  }

  onCheckGroupBySearch(data) {
    const { mode } = this.props
    switch (mode) {
      case 'single-checked':
        this.props.checkUser({
          uri: this.props.userChecked.type === 'group' && String(data.group_info.gid) === this.props.userChecked.uri ? '' : String(data.group_info.gid),
          name: data.group_info.gname,
          type: 'group'
        })
        break
      case 'multi-checked':
        this.props.checkUsers({
          data: {
            uri: String(data.group_info.gid),
            name: data.group_info.gname,
            type: 'group'
          },
          users: this.props.usersChecked.users,
          groups: this.props.usersChecked.groups,
          type: 'group'
        })
        break
      default:
        this.props.handleSelect({
          data: data,
          type: 'group'
        })
        break
    }
  }

  onCheckOrgBySearch(data) {
    this.refs.contactsTab.onLocateOrganization(data)
  }

  onCheckedBySearch(data) {
    switch (data.object_type) {
      case 'user':
        this.onCheckUserBySearch(data)
        break
      case 'group':
        this.onCheckGroupBySearch(data)
        break
      case 'org':
        this.onCheckOrgBySearch(data)
        break
    }
  }

  render() {
    return (
      <div className={styles['left-area']}>
        <div className={styles['search-box']}>
          <Search
            width={275}
            height={this.props.searchHeight}
            inputPadding={[11, 12, 11, 12]}
            searchUser={this.props.searchTypes.includes('user')}
            searchGroup={this.props.searchTypes.includes('group')}
            searchOrgnization={this.props.searchTypes.includes('organization')}
            onSelect={::this.onCheckedBySearch} />
        </div>
        <div className={styles['contacts-box']}>
          <ContactsTab ref="contactsTab" {...this.props} />
        </div>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  userChecked: uCheckedSelector,
  usersChecked: usCheckedSelector
}), actions)(Left)
