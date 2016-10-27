import React from 'react'
import moment from 'moment'
import { getTimestamp } from 'utils/helpers'

import styles from '../styles'

class MsgTime extends React.Component {
  render() {
    const { msg_time } = this.props
    if (!msg_time) return null

    const theSameDay = moment().hour(0).minute(0).second(0).format('x')
    const theSameYear = moment().month(0).date(1).hour(0).minute(0).second(0).format('x')
    const msgTime = getTimestamp(msg_time)

    return <span className={styles.time}>{
      msgTime - theSameDay >= 0 ? moment(msgTime).format('HH:mm') : (msgTime - theSameYear >= 0 ? moment(msgTime).format('MM-DD') : moment(msgTime).format('YYYY-MM-DD'))
    }</span>
  }
}

export default MsgTime
