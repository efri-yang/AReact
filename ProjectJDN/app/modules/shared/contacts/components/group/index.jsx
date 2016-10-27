import React from 'react'
import { connect } from 'react-redux'
import auth from 'utils/auth'
import classNames from 'classnames'
import styles from './styles/index.css'
import Avatar from 'modules/shared/misc/components/avatar'
import * as actions from '../../actions'
import { createStructuredSelector } from 'reselect'
import { groupsSelector, uSelectedSelector, uCheckedSelector, usCheckedSelector } from '../../selectors'

class Groups extends React.Component {
  static propTypes = {
    mode: React.PropTypes.string,
    handleSelect: React.PropTypes.func
  }

  static defaultProps = {
    mode: 'select',
    handleSelect: function () {}
  }

  constructor() {
    super()
    this.state = {
      activeGid: ''
    }
    this.userInfo = auth.getAuth()
    this.limit = 100
  }

  componentDidMount() {
    this.getGroups()
  }

  getGroups() {
    if (this.userInfo) {
      this.props.getGroups({
        uri: this.userInfo.user_id,
        params: {
          $limit: this.limit
        }
      })
    }
  }

  handleSelect(data) {
    this.props.selectUser({
      uri: String(data.gid),
      type: 'group'
    })
    this.props.handleSelect({
      data: data,
      type: 'group'
    })
  }

  handleCheck(data) {
    if (this.props.mode === 'single-checked') {
      this.props.checkUser({
        uri: this.props.userChecked.type === 'group' && String(data.gid) === this.props.userChecked.uri ? '' : String(data.gid),
        name: data.gname,
        type: 'group'
      })
    } else if (this.props.mode === 'multi-checked') {
      this.props.checkUsers({
        data: {
          uri: String(data.gid),
          name: data.gname,
          type: 'group'
        },
        users: this.props.usersChecked.users,
        groups: this.props.usersChecked.groups,
        type: 'group'
      })
    }
  }

  hadChecked(uri) {
    const groups = this.props.usersChecked.groups
    for (let i = 0; i < groups.length; i++) {
      if (String(uri) === groups[i].uri) {
        return true
      }
    }
    return false
  }

  render() {
    const that = this
    const list = that.props.groups.items || []
    const mode = that.props.mode

    return (
      <ul className={classNames(styles['group-area'], {checked: that.props.mode !== 'select'})}>{
        mode.indexOf('checked') !== -1 ? list.map(function (item, key) {
          const group = item.group_info
          const checked = that.hadChecked(group.gid)
          return (
            <li
              key={key}
              className={classNames({checked: (that.props.userChecked.type === 'group' && that.props.userChecked.uri === String(group.gid)) || checked})}>
              <span className={styles['checkbox']} onClick={that.handleCheck.bind(that, group)}></span>
              <Avatar type="group" uri={group.gid} />
              <span className="gname">{group.gname}</span>
            </li>
          )
        }) : list.map(function (item, key) {
          const group = item.group_info
          return (
            <li
              key={key}
              className={classNames({active: that.props.userSelected.type === 'group' && that.props.userSelected.uri === String(group.gid)})}
              onClick={that.handleSelect.bind(that, group)}>
              <Avatar type="group" uri={group.gid} />
              <span className="gname">{group.gname}</span>
            </li>
          )
        })
      }</ul>
    )
  }
}

export default connect(createStructuredSelector({
  groups: groupsSelector,
  userSelected: uSelectedSelector,
  userChecked: uCheckedSelector,
  usersChecked: usCheckedSelector
}), actions)(Groups)
