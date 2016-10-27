import React from 'react'
import styles from 'theme/styles'

export default props => {
  let { type, className, ...other } = props
  className = styles[`icon-${type}`] + ' ' + className
  return <i className={className} {...other} />
}
