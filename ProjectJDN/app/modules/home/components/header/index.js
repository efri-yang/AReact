import React from 'react'
import i18n from 'i18n'
import styles from './styles'

export default class extends React.Component {
  render() {
    const { container, icon, brand, online } = styles

    return (
      <div className={container}>
        <span className={brand}>
          <i className={icon}></i>
          <span className={styles['brand-text']}>{i18n.t('app.name')}</span>
        </span>
        <span className={online}></span>
      </div>
    )
  }
}
