import React from 'react'
import styles from './index.css'
import i18n from 'i18n'
// import {Scrollbars} from 'react-custom-scrollbars'
class Cloud extends React.Component {

  render() {
    return (
      <div className={styles['not-implement']}>
        {i18n.t('notImplementYet')}
      </div>
    )
  }
}

export default Cloud
