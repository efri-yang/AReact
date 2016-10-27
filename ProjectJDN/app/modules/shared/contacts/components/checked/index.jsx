import React from 'react'
import { connect } from 'react-redux'
import { Scrollbars } from 'react-custom-scrollbars'
import i18n from 'i18n'
import styles from './styles/index.css'
import * as actions from '../../actions'
import { createStructuredSelector } from 'reselect'
import { uCheckedSelector, usCheckedSelector } from '../../selectors'
import Avatar from 'modules/shared/misc/components/avatar'
import { Icon } from 'modules/shared/misc/components'

class Checked extends React.Component {
  static propTypes = {
    mode: React.PropTypes.string, // 'single-checked'或'multi-checked'
    handleSubmit: React.PropTypes.func
  }

  static defaultProps = {
    mode: 'single-checked',
    handleSubmit: function () {}
  }

  constructor() {
    super()
    this.t = i18n.getFixedT(null, 'contacts')
  }

  delUser(data) {
    if (this.props.mode === 'single-checked') {
      this.props.checkUser({
        uri: data.uri !== this.props.userChecked.uri ? data.uri : '',
        name: data.name,
        type: data.type
      })
    } else if (this.props.mode === 'multi-checked') {
      this.props.checkUsers({
        data: {
          uri: data.uri,
          name: data.name,
          type: data.type
        },
        users: this.props.usersChecked.users,
        groups: this.props.usersChecked.groups,
        type: data.type
      })
    }
  }

  handleSubmit() {
    let {mode, userChecked, usersChecked} = this.props

    if (mode === 'single-checked') {
      this.props.handleSubmit(userChecked)
    } else {
      this.props.handleSubmit({
        users: usersChecked.users,
        groups: usersChecked.groups
      })
    }
  }

  render() {
    const that = this
    const mode = that.props.mode
    const list = mode === 'single-checked'
      ? (that.props.userChecked.uri !== undefined && that.props.userChecked.uri !== '' ? [that.props.userChecked] : [])
      : that.props.usersChecked.users.concat(that.props.usersChecked.groups)
    return (
      <div className={styles['selected-area']}>
        <div className={styles['selected-count']}>{that.t('checked.hadChecked', {n: list.length})}</div>
        <ul className={styles['selected-ul']}>
          <Scrollbars>{
            list.map(function (item, key) {
              return (
                <li key={item.uri}>
                  <Avatar
                    uri={item.uri}
                    width="40"
                    height="40"/>
                  {item.name}
                  <Icon type="lianxirenshanchu" className={styles.del} onClick={that.delUser.bind(that, item)} />
                </li>
              )
            })
          }</Scrollbars>
        </ul>
        <div className={styles['selected-footer']}>
          <button onClick={::that.handleSubmit} disabled={list.length === 0}>{that.t('confirm')}</button>
        </div>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  userChecked: uCheckedSelector,
  usersChecked: usCheckedSelector
}), actions)(Checked)
