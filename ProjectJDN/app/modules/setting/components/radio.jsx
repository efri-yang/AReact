/**
 * rc-radio样式不好重写，故重复造轮子
 */
import styles from './index.css'
import { Icon } from 'modules/shared/misc/components'
import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'

class Radio extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  }

  render() {
    const {label, checked} = this.props
    let cls = classNames({
      [styles['radio']]: true,
      [styles.checked]: checked
    })
    return (
      <div onClick={::this._handleChange} className={cls}>
        <span>
          {checked
          ? <Icon type="success"/>
          : null}
        </span>
        <label>{label}</label>
      </div>
    )
  }

  _handleChange() {
    this.props.onChange()
  }
}

export default Radio
