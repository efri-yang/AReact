import React, { Component } from 'react'
import cx from 'classnames'
import Icon from '../icon'
import styles from './styles.css'

export default class Spinner extends Component {
  render() {
    const { width, height, className, ...other } = this.props
    const style = {
      width,
      height,
      lineHeight: `${height}px`
    }
    const classes = cx(styles.placeholder, {
      [className]: className
    })
    return (
      <div className={classes} style={style}>
        <span className={styles.wave} {...other}>
          <Icon type="contacts-o" />
        </span>
      </div>
    )
  }
}
