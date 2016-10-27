import React from 'react'
import { connect } from 'react-redux'
import auth from 'utils/auth'
import classNames from 'classnames'
import styles from './styles/index.css'
import * as contactsActions from '../../actions'
import * as msgActions from 'modules/message/actions'
import { createStructuredSelector } from 'reselect'
import { uSelectedSelector, uCheckedSelector, usCheckedSelector } from '../../selectors'
import Avatar from 'modules/shared/misc/components/avatar'
import { Icon } from 'modules/shared/misc/components'

class Recent extends React.Component {
  static propTypes = {
    mode: React.PropTypes.string,
    handleSelect: React.PropTypes.func,
    handleDel: React.PropTypes.func,
    recentList: React.PropTypes.arrayOf(React.PropTypes.shape({
      uri: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]).isRequired,
      name: React.PropTypes.string.isRequired,
      type: React.PropTypes.string.isRequired
    }))
  }

  static defaultProps = {
    mode: 'select',
    handleSelect: function () {},
    handleDel: function () {},
    recentList: []
  }

  userInfo = auth.getAuth()

  limit = 200

  handleSelect(data) {
    this.props.selectUser({
      uri: String(data.user_id),
      type: 'user'
    })
    this.props.handleSelect({
      data: data,
      type: 'user'
    })
  }

  handleCheck(data) {
    if (this.props.mode === 'single-checked') {
      this.props.checkUser({
        uri: this.props.userChecked.type === data.type && String(data.uri) === this.props.userChecked.uri ? '' : String(data.uri),
        name: data.name,
        type: data.type
      })
    } else if (this.props.mode === 'multi-checked') {
      this.props.checkUsers({
        data: {
          uri: String(data.uri),
          name: data.name,
          type: data.type
        },
        users: this.props.usersChecked.users,
        groups: this.props.usersChecked.groups,
        type: data.type
      })
    }
  }

  hadChecked(type, uri) {
    const users = type === 'user' ? this.props.usersChecked.users : this.props.usersChecked.groups
    for (let i = 0; i < users.length; i++) {
      if (String(uri) === users[i].uri) {
        return true
      }
    }
    return false
  }

  handleDel(data) {
    this.props.handleDel(data)
  }

  render() {
    const that = this
    const recentData = that.props.recentList
    const mode = that.props.mode

    return (
      <ul className={classNames(styles['recent-area'], {checked: that.props.mode !== 'select'})}>{
        mode.indexOf('checked') !== -1 ? recentData.map(function (item, key) {
          const checked = that.hadChecked(item.type, item.uri)
          if (item.type === 'group') {
            return (
              <li key={key} className={classNames({checked: (that.props.userChecked.type === 'group' && that.props.userChecked.uri === String(item.uri)) || checked})}>
                <span className={classNames(styles['checkbox'])} onClick={that.handleCheck.bind(that, item)}></span>
                <span className={styles['img-box']}><Avatar type="group" uri={item.uri} /></span>
                <span className="rname">{item.name}</span>
              </li>
            )
          }
          return (
            <li key={key} className={classNames({checked: (that.props.userChecked.type === 'user' && that.props.userChecked.uri === String(item.uri)) || checked})}>
              <span className={classNames(styles['checkbox'])} onClick={that.handleCheck.bind(that, item)}></span>
              <span className={styles['img-box']}><Avatar uri={item.uri}/></span>
              <span className="rname">{item.name}</span>
            </li>
          )
        }) : recentData.map(function (item, key) {
          if (item.type === 'group') {
            return (
              <li key={key} className={classNames({active: that.props.userSelected.type === 'group' && that.props.userSelected.uri === String(item.uri)})} onClick={that.handleSelect.bind(that, item)}>
                <Icon type="lianxirenshanchu" className={styles.del} onClick={that.handleDel.bind(that, item)} />
                <span className={styles['img-box']}><Avatar type="group" uri={item.uri} /></span>
                {item.name}
              </li>
            )
          }
          return (
            <li key={key} className={classNames({active: that.props.userSelected.type === 'user' && that.props.userSelected.uri === String(item.uri)})} onClick={that.handleSelect.bind(that, item)}>
              <Icon type="lianxirenshanchu" className={styles.del} onClick={that.handleDel.bind(that, item)} />
              <span className={styles['img-box']}><Avatar uri={item.uri}/></span>
              {item.name}
            </li>
          )
        })
      }</ul>
    )
  }
}

export default connect(createStructuredSelector({
  userSelected: uSelectedSelector,
  userChecked: uCheckedSelector,
  usersChecked: usCheckedSelector
}), {...contactsActions, ...msgActions})(Recent)
