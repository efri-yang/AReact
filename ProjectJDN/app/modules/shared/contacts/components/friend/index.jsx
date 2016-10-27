import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import auth from 'utils/auth'
import styles from './styles/index.css'
import Group from './group'
import * as actions from '../../actions'
import { createStructuredSelector } from 'reselect'
import { fGroupsSelector } from '../../selectors'

class Friend extends React.Component {
  static propTypes = {
    mode: React.PropTypes.string,
    handleSelect: React.PropTypes.func
  }

  static defaultProps = {
    mode: 'select',
    handleSelect: function () {}
  }

  userInfo = auth.getAuth()

  componentDidMount() {
    this.getGroups()
  }

  getGroups() {
    if (this.userInfo) {
      this.props.getFriendGroups()
    }
  }

  render() {
    const that = this
    const fGroups = that.props.fGroups

    return (
      <div className={classNames(styles['friend-area'], {checked: that.props.mode !== 'select'})}>{
        fGroups.map(function (item, key) {
          return <Group
            key={item.tag_id}
            item={item}
            mode={that.props.mode}
            handleSelect={that.props.handleSelect} />
        })
      }</div>
    )
  }
}

export default connect(createStructuredSelector({
  fGroups: fGroupsSelector
}), actions)(Friend)
