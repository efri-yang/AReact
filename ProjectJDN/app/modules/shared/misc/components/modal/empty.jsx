import React from 'react'
import i18n from 'i18n'
import styles from './styles/index.css'

class Empty extends React.Component {
  groupT = i18n.getFixedT(null, 'group')

  render() {
    return (
      <div className={this.props.className}>
        <div className={styles['empty-area']}>
          <div className={styles['img']}></div>
          <h3>{this.groupT('empty')}</h3>
          <p>{this.props.tip}</p>
        </div>
      </div>
    )
  }
}

export default Empty
