import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import * as URL from 'constants/url'
import Image from 'nd-rc/lib/image'
import defaultImg from 'theme/images/broken-img-down.png'
import {replaceAuthInfo} from 'utils/helpers'

class App extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired
  }

  render() {
    const {data: item} = this.props
    let msgUrl = item['msg_url']
    return (
      <div className={`pure-u-1-8 ${styles.item}`} onClick={this._handleJump.bind(this, item.address)}>
        <a href="javascript:void(0)" title={item.name} key={item.id}>
          <div className={styles.icon}>
            <Image
              defaultSrc={defaultImg}
              src={`${URL.CDNCS}/v0.1/download?dentryId=${item.icon}&size=80`}/>
            {msgUrl && (msgUrl['msg_count'] || msgUrl['has_tip'])
            ? <span className={styles.tip}>{Math.min(msgUrl['msg_count'] + msgUrl['has_tip'], 99)}</span>
            : null}
          </div>
          <div className={styles['app-name']}>{item.name}</div>
        </a>
      </div>
    )
  }

  _handleJump(addr) {
    let link = replaceAuthInfo(addr)
    window.open(link)
  }
}

export default App
