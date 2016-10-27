import React, { Component } from 'react'
import Item from './item'
import styles from './styles'

let seed = 1

class Notification extends Component {
  constructor() {
    super()
    this.noticeItems = {}
    this.state = {
      notices: []
    }
  }

  render() {
    const { notices } = this.state

    return (
      <div className={styles.wrapper}>
        {notices.map(notice => {
          return <Item ref={c => { this.noticeItems[notice.id] = c }} key={notice.id} notice={notice} onLeave={::this.removeNode} />
        })}
      </div>
    )
  }

  add(notice) {
    const { notices } = this.state
    const noticesLength = notices.length
    notice.id = Date.now() + seed++
    notice.duration = notice.duration || 1500

    if (noticesLength) {
      const lastNotice = notices.pop()

      if (notice.single && lastNotice.single) {
        notices.push(notice)
      } else {
        notices.push(lastNotice, notice)
      }
    } else {
      notices.push(notice)
    }

    this.setState({
      notices: notices
    })

    return notice.id
  }

  remove(id) {
    if (this.noticeItems[id]) {
      this.noticeItems[id].leave()
      delete this.noticeItems[id]
    }
  }

  removeNode(id) {
    let { notices } = this.state
    notices = notices.filter(notice => notice.id !== id)
    this.setState({
      notices: notices
    })
  }

  clear() {
    this.setState({
      notices: []
    })
  }
}

export default Notification
