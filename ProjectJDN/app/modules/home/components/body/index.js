import React from 'react'
import styles from './styles'

export default class extends React.Component {
  render() {
    return (
      <div className={`pure-u-7-8 ${styles.container}`} id="container">
        {this.props.children}
      </div>
    )
  }
}
