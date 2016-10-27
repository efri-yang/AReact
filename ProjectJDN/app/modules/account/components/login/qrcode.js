import React from 'react'
import axios from 'axios'
import $dp from 'dataProvider'
import Image from 'nd-rc/lib/image'
import { Icon } from 'modules/shared/misc/components'
import auth from 'utils/auth'
import * as URL from 'constants/url'
import * as C from '../../constants'
import styles from './styles/login.css'

class QrCode extends React.Component {
  constructor() {
    super()
    this.channelId = ''
    this.state = {
      qrCodeUrl: null,
      avatarUrl: null
    }
  }

  componentDidMount() {
    this.fetchQrcode()
  }

  componentWillUnmount() {
    axios.abort(C.QRCODE_REQUEST_ID)
  }

  render() {
    const { qrCodeUrl, avatarUrl } = this.state

    return (
      <div className={styles.qrcode}>
        <Image src={avatarUrl || qrCodeUrl} defaultSrc={qrCodeUrl} isShowSpinner width="150" height="150"/>
        {avatarUrl && <span className={styles.back} onClick={::this.back2Qrcode}><Icon type="qrcode"/></span>}
      </div>
    )
  }

  /**
   * 1. 获取二维码
   * @private
   */
  fetchQrcode() {
    $dp.transfer.channel
      .query({
        type: 'login',
        appid: 'imdq6gwpt89fdaygj8',
        action: 'create'
      }).get()
      .then(res => {
        this.channelId = res.data['channel_id']
        this.setState({
          qrCodeUrl: res.data['qrcode_url']
        })
        this.fetchUserInfo()
      })
      .catch(data => {
        console.log(data)
      })
  }

  /**
   * 2. 客户端扫描后，获取用户信息成功，等待客户端确认登录返回票据
   * @param channel
   * @private
   */
  fetchUserInfo() {
    const self = this

    $dp.transfer.channel
      .get(this.channelId, {
        requestId: C.QRCODE_REQUEST_ID
      })
      .then(res => {
        const { errno, data } = res.data
        if (errno !== 0) {
          // 二维码过期
          self.fetchQrcode() // 重新获取
        } else {
          let userId = data['user_id']
          self.setState({
            avatarUrl: URL.AVATAR.USER + '/' + userId + '/' + userId + '.jpg?size=160'
          })
          self.fetchToken()
        }
      })
      .catch(data => {
        console.log(data)
      })
  }

  /**
   * 3. 获取票据
   * @param channel
   * @private
   */
  fetchToken() {
    const self = this

    $dp.transfer.channel
      .get(this.channelId, {
        requestId: C.QRCODE_REQUEST_ID
      })
      .then(res => {
        const { errno, data: {access_token, mac_key} } = res.data
        if (errno !== 0) {
          console.log('qrcode login failure')
        } else {
          const nonce = auth._getNonce()

          self.props.ssoLogin({
            token: access_token,
            nonce: nonce,
            mac: auth._getMac(nonce, 'GET', '/', URL.LOC_HOST, mac_key),
            host: URL.LOC_HOST
          })
        }
      })
      .catch(data => {
        console.log(data)
        console.log('qrcode login failure')
      })
  }

  back2Qrcode() {
    this.setState({
      qrCodeUrl: null,
      avatarUrl: null
    })
    axios.abort(C.QRCODE_REQUEST_ID)
    this.fetchQrcode()
  }
}

export default QrCode
