import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import Dock from 'modules/shared/misc/components/modal/dock'
import { Icon } from 'modules/shared/misc/components'
import * as $h from 'utils/helpers'
import * as URL from 'constants/url'
import { createStructuredSelector } from 'reselect'
import { selectors as miscSelectors } from 'modules/shared/misc'
import i18n from 'i18n'
import styles from './styles.css'

class RecordBox extends React.Component {
  constructor(props) {
    super()
    this.t = i18n.getFixedT(null, 'message')
    this.state = {
      hisLoaded: false
    }
  }

  static propTypes = {
    convId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  }

  render() {
    const src = this._getHistoryUrl(this.props.convId)
    const title = this.t('chatLog')
    const { hisLoaded } = this.state
    return (
      <div>
        <Dock
          entrance={<Icon type="liaotianjilu" className={styles.liaotianjilu} title={title} />}
          title={title}
          handleOpen={::this._handleOpen}
          handleClose={::this._handleClose}>
          {hisLoaded ? <iframe src={src} className={styles['iframe']}/> : null}
        </Dock>
      </div>
    )
  }

  _handleOpen() {
    // 防止dock滑出时卡顿
    setTimeout(this.setState.bind(this, {hisLoaded: true}), 150)
  }

  _handleClose() {
    this.setState({
      hisLoaded: false
    })
  }

  _getHistoryUrl(convId) {
    let hisUrl = URL.IM_HISTORY
    let token = $h.generateHisToken(convId, hisUrl)
    let lang = i18n.language
    let newHisUrl = hisUrl.replace('#conv_id#', convId)
                          .replace('#token#', token).replace('#lang#', lang)
    return newHisUrl
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector
}), {})(RecordBox)
