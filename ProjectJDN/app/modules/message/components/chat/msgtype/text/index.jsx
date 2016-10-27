import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import {autolinker, richSpan2RC} from '../utils'
import ats from '../../msgflow/ats'

class TextMsg extends Component {
  constructor(props, context) {
    super()
    let {data} = props
    if (data && data.length > 2 && data.indexOf('.') !== -1) {
      data = autolinker(data)
    }
    let {content, next} = ats.highlight(data, context.msg)
    this.next = next
    try {
      this.component = richSpan2RC(`<span>${content}</span>`)
    } catch (e) {
      console.error('parse text message failed!', data)
      this.component = content
    }
  }

  static propTypes = {
    data: PropTypes.string.isRequired
  }

  static contextTypes = {
    msg: PropTypes.object
  }

  componentDidMount() {
    const {msg} = this.context
    this.next && this.next(msg)
  }

  render() {
    let {component} = this
    return (
      <div className={styles['text']}>
        {component}
      </div>
    )
  }
}

export default TextMsg
