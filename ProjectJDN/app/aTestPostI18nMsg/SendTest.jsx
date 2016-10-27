import React from 'react'
import SendI18nMsg from 'aTestPostI18nMsg'

class SendTest extends React.Component {
  render() {
    return (
      <div style={{position: 'fixed', display: 'none', top: '10px'}}>
        <textarea
          ref="textarea"
          cols="100"
          rows="10"
          placeholder="投递消息体" />
        <button onClick={::this._handleSendMsg}>SEND</button>
      </div>
    )
  }

  _handleSendMsg() {
    let data = this.refs.textarea.value
    SendI18nMsg(JSON.parse(data))
  }
}

export default SendTest
