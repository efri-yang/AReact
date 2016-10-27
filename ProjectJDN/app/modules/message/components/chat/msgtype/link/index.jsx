import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import * as $h from 'utils/helpers'
import Msg from 'modules/shared/misc/components/message'
import linkIconB from 'theme/images/link_b.png'
import linkIconW from 'theme/images/link_w.png'
import Image from '../img/image'
import i18n from 'i18n'
import {MSG_DIR} from 'modules/message/constants'

class LinkMsg extends Component {
  constructor(props, context) {
    super()
    this.t = i18n.getFixedT(null, 'message')
    this.defaultIcon = context.msg['_direction'] === MSG_DIR.UP
      ? linkIconW : linkIconB
  }

  static propTypes = {
    data: PropTypes.object.isRequired
  }

  static contextTypes = {
    msg: PropTypes.object.isRequired
  }

  render() {
    let data = this.props.data.json.link
    let href = data['pc-href'] || data['data-href'] // pc-href优先
    let requestUri = data['request-uri'] || undefined // 以防万一
    let {title, summary, from: linkFrom} = data
    title = typeof title === 'string' ? this._escape(title) : null
    summary = typeof summary === 'string' ? this._escape(summary) : null
    linkFrom = typeof linkFrom === 'string' ? this._escape(linkFrom) : null

    return (
      <div className={styles['link']}
        onClick={::this._handleJump.bind(this, href, requestUri)}>
        <div className={styles['left-img']}>
          <Image
            src={data.img ? data.img.src : this.defaultIcon}
            defaultSrc={this.defaultIcon}/>
        </div>
        <div className={styles['right-info']}>
          {title ? <div className={styles['title']} dangerouslySetInnerHTML={{__html: title}}></div> : null}
          {summary ? <div className={styles['summary']} dangerouslySetInnerHTML={{__html: summary}}></div> : null}
          {linkFrom ? <div className={styles['from']} dangerouslySetInnerHTML={{__html: linkFrom}}></div> : null}
        </div>
      </div>
    )
  }

  _escape(str) {
    if (/&#x[0-9|a-f|A-F]+;/g.test(str)) {
      str = str.replace('<', '&lt;').replace('>', '&gt;')
    }
    return str
  }

  _handleJump(href, requestUri) {
    if (/^cmp:\/\//.test(href)) {
      Msg.info(this.t('jumpOperNotSupport'))
    } else {
      href = decodeURIComponent(href)
      requestUri = requestUri && decodeURIComponent(requestUri)
      window.open($h.replaceAuthInfo(href, requestUri))
    }
  }

}

export default LinkMsg
