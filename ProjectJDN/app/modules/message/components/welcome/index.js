import React from 'react'
import i18n from 'i18n'
import styles from './styles'

export default class Welcome extends React.Component {
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.text}>
          {i18n.t('intro')}
        </div>
      </div>
    )
  }
}
