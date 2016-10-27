import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import auth from 'utils/auth'
import styles from './styles/index.css'
import * as actions from '../../actions'
import { createStructuredSelector } from 'reselect'
import { friendsSelector, uSelectedSelector, uCheckedSelector, usCheckedSelector } from '../../selectors'
import Avatar from 'modules/shared/misc/components/avatar'

class Friend extends React.Component {
  static propTypes = {
    item: React.PropTypes.object,
    mode: React.PropTypes.string,
    handleSelect: React.PropTypes.func,
    checkedUsers: React.PropTypes.array
  }

  static defaultProps = {
    item: { },
    mode: 'select',
    handleSelect: function () {}
  }

  constructor() {
    super()
    this.state = {
      list: null,
      open: false
    }
    this.list = null
    this.userInfo = auth.getAuth()
    this.limit = 200
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.allGroupFriends.tag_id === this.props.item.tag_id || nextProps.allGroupFriends.tag_id === undefined) {
      this.list = nextProps.allGroupFriends.items ? nextProps.allGroupFriends.items.filter(item => {
        return item.tag_id === this.props.item.tag_id ? item : null
      }) : null
    }
  }

  handlerOpenGroup(tag_id) {
    const open = !this.state.open
    this.setState({
      open: open
    })
    if (open) {
      this.props.getFriendsOfGroup({
        tag_id: tag_id,
        $limit: this.limit
      })
    }
  }

  handleSelect(data) {
    //data.name = String(data.description || data.uri_name || data.uri)
    data.name = String(data.uri_name || data.uri)
    this.props.selectUser({
      uri: String(data.uri),
      type: 'user'
    })
    this.props.handleSelect({
      data: data,
      type: 'user'
    })
  }

  handleCheck(data) {
    //const name = String(data.description || data.uri_name || data.uri)
    const name = String(data.uri_name || data.uri)
    if (this.props.mode === 'single-checked') {
      this.props.checkUser({
        uri: this.props.userChecked.type === 'user' && String(data.uri) === this.props.userChecked.uri ? '' : String(data.uri),
        name: name,
        type: 'user'
      })
    } else if (this.props.mode === 'multi-checked') {
      this.props.checkUsers({
        data: {
          uri: String(data.uri),
          name: name,
          type: 'user'
        },
        users: this.props.usersChecked.users,
        groups: this.props.usersChecked.groups,
        type: 'user'
      })
    }
  }

  hadChecked(uri) {
    const users = this.props.usersChecked.users
    for (let i = 0; i < users.length; i++) {
      if (String(uri) === users[i].uri) {
        return true
      }
    }
    return false
  }

  render() {
    const that = this
    const { item, mode } = that.props
    const { open } = that.state
    const allGroupFriends = that.list
    return (
      <div>{
        mode.indexOf('checked') !== -1
        ? <div className={classNames(styles['group'], {open: open})}>
          <div className={styles['group-title']} onClick={that.handlerOpenGroup.bind(that, item.tag_id)}>
            <span className={styles['group-title-switch']}></span>
            {item.title + '(' + (allGroupFriends ? allGroupFriends.length : item.friend_sum) + ')'}
          </div>
          {
            <ul className={styles['friend-items']}>{
              allGroupFriends && allGroupFriends.map(function (iitem, kkey) {
                const checked = that.hadChecked(iitem.uri)
                //const name = String(iitem.description || iitem.uri_name || iitem.uri)
                const name = String(iitem.uri_name || iitem.uri)
                return <li key={kkey} className={classNames({checked: (that.props.userChecked.type === 'user' && that.props.userChecked.uri === String(iitem.uri)) || checked})}>
                  <span
                    className={classNames(styles['checkbox'])}
                    onClick={that.handleCheck.bind(that, iitem)}></span>
                  <span className={styles['img-box']}><Avatar uri={iitem.uri}/></span>
                  <span className="fname">{name}</span>
                </li>
              })
            }</ul>
          }
        </div>
        : <div className={classNames(styles['group'], {open: open})}>
          <div className={styles['group-title']} onClick={that.handlerOpenGroup.bind(that, item.tag_id)}>
            <span className={styles['group-title-switch']}></span>
            {item.title + '(' + (allGroupFriends ? allGroupFriends.length : item.friend_sum) + ')'}
          </div>
          {
            <ul className={styles['friend-items']}>{
              allGroupFriends && allGroupFriends.map(function (iitem, kkey) {
                //const name = String(iitem.description || iitem.uri_name || iitem.uri)
                const name = String(iitem.uri_name || iitem.uri)
                return <li key={kkey} className={classNames({active: that.props.userSelected.type === 'user' && that.props.userSelected.uri === String(iitem.uri)})} onClick={that.handleSelect.bind(that, iitem)}>
                  <span className={styles['img-box']}><Avatar uri={iitem.uri}/></span>
                  <span className="fname">{name}</span>
                </li>
              })
            }</ul>
          }
        </div>
      }</div>
    )
  }
}

export default connect(createStructuredSelector({
  allGroupFriends: friendsSelector,
  userSelected: uSelectedSelector,
  userChecked: uCheckedSelector,
  usersChecked: usCheckedSelector
}), actions)(Friend)
