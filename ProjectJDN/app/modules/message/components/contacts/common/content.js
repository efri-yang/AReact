import React from 'react'
import i18n from 'i18n'
import Interpolate from 'i18n/interpolate'
import { getContentType, getContentNode } from 'utils/parserContent'
import { isAgent } from 'utils/helpers'
import UserName from 'modules/shared/contacts/components/username'
import AgentName from 'modules/shared/misc/components/agentname'
import { constants as C } from 'modules/message'
import { MSG_TYPE } from 'constants'

import styles from '../styles'

class MsgContent extends React.Component {
  constructor() {
    super()
    this.state = {
      isVisible: false
    }
    this.t = i18n.getFixedT(null, 'message')
  }

  componentDidMount() {
    const that = this
    setTimeout(function () {
      that.setState({
        isVisible: true
      })
    }, 300)
  }

  getAtsInfo() {
    const { data, convAtInfo } = this.props
    const { convid } = data
    let atInfo = convAtInfo[convid]
    if (!atInfo) {
      return -2
    }
    if (atInfo.length === 1) {
      return atInfo[0]
    }
    return -1
  }

  render() {
    const { data, isActive } = this.props
    const contentType = getContentType(data)
    const isSystemMsg = contentType === MSG_TYPE.NTF || contentType === MSG_TYPE.CTL || contentType === MSG_TYPE.TIP || contentType === MSG_TYPE.STREAM || contentType === MSG_TYPE.TEL
    const contentNode = getContentNode(data)
    const atsInfo = this.getAtsInfo()
    const resrcType = data['sender_ua_uri']
        ? data['sender_ua_uri']['resource_type'] : undefined
    const resrcData = data['sender_ua_uri']
        ? data['sender_ua_uri']['resource_data'] : {}
    const resrcUid = resrcType !== 3 && resrcData.uid && !isAgent(resrcData.uid)
        ? resrcData.uid : undefined

    let atNotice = atsInfo !== -2
    ? (
      <span className={styles['color-f43531']}>
      {atsInfo === -1
        ? <Interpolate i18nKey="message:somebodyAtYou"
          component={this.t('somebody')} />
        : <Interpolate
          i18nKey="message:somebodyAtYou"
          component={isAgent(atsInfo) ? <AgentName uri={atsInfo}/> : <UserName uid={atsInfo}/>} />
      }
      </span>
    ) : null

    return (
      <p className={styles.content}>
        {atNotice}
        {data._draft && !isActive
          ? <span>
            <span className={styles['color-f43531']}>{this.t('draft')}</span>
            {data._draft}
          </span>
          : <span style={{display: this.state.isVisible ? 'inline' : 'none'}}>
            {
              data.convtype === C.CONVTYPE.GRP && data.content && resrcUid && !isSystemMsg
              ? <span><UserName uid={resrcUid}/>: </span>
              : ''
            }
            <span ref="content">{contentNode}</span>
          </span>}
      </p>
    )
  }
}

export default MsgContent
