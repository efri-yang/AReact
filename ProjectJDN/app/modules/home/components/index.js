import styles from './index.css'

import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import i18n from 'i18n'
import Confirm from 'modules/shared/misc/components/modal/confirm'
import Notification from 'modules/shared/misc/components/notification'
import message from 'modules/shared/misc/components/message'
import GlobalMessage from 'modules/shared/misc/components/message/global'
import GlobalLoading from 'modules/shared/misc/components/loading'

import Header from './header'
import SideBar from './sidebar'
import Body from './body'

import localforage from 'localforage'
import $cache from 'cache'
// 获取服务端推送消息
import { sagas } from 'modules/message'
import { actions as msgActions, selectors } from 'modules/message'
import { promiseAll, transformMessages } from 'utils/helpers'
import auth from 'utils/auth'
import sleepWatcher from 'utils/sleepWatcher'

localforage.config({name: 'WEB-IM'})
sagas.run()

const initState = () => {
  const uid = auth.getTokens('user_id')
  return promiseAll([
    $cache.recentConversations.get(uid),
    $cache.conversationMessages.get(uid),
    $cache.i18nMsg.resource.get(),
    $cache.i18nMsg.template.get()
  ])
}

class Home extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  componentWillMount() {
    initState()
      .then(([conversations, messages, i18nMsgResource, i18nMsgTemplate]) => {
        conversations && this.props.initConversations(conversations)
        messages && this.props.initMessages(transformMessages(messages))
        i18nMsgResource && $cache.i18nMsg.resource.initiate(i18nMsgResource)
        i18nMsgTemplate && $cache.i18nMsg.template.initiate(i18nMsgTemplate)
        this.props.pullMessages()
      })
      .catch(() => {
        this.props.pullMessages()
      })
  }

  componentDidMount() {
    this.props.getEmotionPackages({
      $limit: 100
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.offlineNotice) {
      this.refs.offlineModal.handleOpen()
      auth.destroy()
      sleepWatcher.stop()
    }
  }

  render() {
    const { offlineNotice } = this.props
    const offlineTip = offlineNotice && offlineNotice.reason ? 'offline.kicked' : 'offline.tip'

    return (
      <div ref="container" className={styles.container}>
        <GlobalLoading />
        <GlobalMessage />
        <Notification ref={(c) => { message.notification = c }}/>
        <Header />
        <div className={`pure-g ${styles.body}`}>
          <SideBar />
          <Body {...this.props} />
        </div>

        <Confirm
          ref="offlineModal"
          width="320"
          animation={undefined}
          closable={false}
          title={i18n.t('offline.title')}
          noCancel
          handleOk={::this.handleOffline}
          onAfterClose={::this.handleOffline}>
          <p>{i18n.t(offlineTip)}</p>
        </Confirm>

      </div>
    )
  }

  handleOffline() {
    this.context.router.replace('/logout')
    this.props.offline(null)
  }
}

export default connect(createStructuredSelector({
  offlineNotice: selectors.offlineNoticeSelector
}), { ...msgActions })(Home)
