import React, { Component } from 'react'
import { connect } from 'react-redux'
import md5s from 'nd-md5s'
import i18n from 'i18n'
import auth from 'utils/auth'
import Form from './form'
import QrCode from './qrcode'
import * as actions from '../../actions'
import { createStructuredSelector } from 'reselect'
import { selectors } from 'modules/shared/misc'
import LangSelect from 'modules/shared/misc/components/langSelect'
import ReactSpinner from 'nd-rc/lib/spinner'

import styles from './styles/login'

class Login extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  constructor() {
    super()
    this.t = i18n.getFixedT(null, 'account')
    this.tokens = auth.getTokens()
    this.state = {
      isSSO: Boolean(this.tokens)
    }
  }

  componentDidMount() {
    if (this.state.isSSO) {
      // 单点登录
      this.props.login({
        isSSO: true,
        tokens: this.tokens,
        onSuccess: ::this.onSuccess,
        onError: ::this.onError
      })
    }
  }

  render() {
    const { form: formLocale, qr: qrLocale, wait } = this.t('login')
    const { isLoading, globalMessage } = this.props
    let errorMsg = ''

    if (!isLoading) {
      let { message } = globalMessage
      if (message) {
        if (typeof message === 'object') {
          errorMsg = this.t(`error:${message.code}`) || message.message || this.t('commonError')
        }
      }
    }

    if (this.state.isSSO) {
      // 单点登录，不显示表单
      return (
        <div className={styles['sso-container']}>
          <ReactSpinner/>
          <div className={styles.text}>{wait}</div>
        </div>
      )
    }

    return (
      <div className={styles.container}>
        <div className={styles['form-container']}>
          <div className={styles['form-title']}>{formLocale.title}</div>
          <Form isSubmiting={this.props.isLoading} errorMsg={errorMsg} onSubmit={::this.handleSubmit} formLocale={formLocale}/>
          <div className={styles['lang-container']}>
            <span className={styles['lang-change']}>{i18n.t('changeLanguage')}</span>
            <LangSelect width={115}/>
          </div>
        </div>
        <div className={styles['qr-container']}>
          <QrCode ssoLogin={::this.ssoLogin}/>
          {qrLocale.open99u}<br/>{qrLocale.scan}
        </div>
      </div>
    )
  }

  handleSubmit(formData) {
    this.props.login({
      'login_name': formData.name,
      'password': md5s(formData.password, '\xa3\xac\xa1\xa3fdjf,jkgfkl'),
      onSuccess: ::this.onSuccess
    })
  }

  ssoLogin(data) {
    this.props.login({
      ...data,
      isSSO: true,
      onSuccess: ::this.onSuccess
    })
  }

  onSuccess() {
    const { location } = this.props
    let nextPath = '/'

    if (location.state && location.state.nextPathname) {
      nextPath = location.state.nextPathname
    }

    this.context.router.push(nextPath)
  }

  onError() {
    this.setState({
      isSSO: false
    })
  }
}

export default connect(
  createStructuredSelector({
    isLoading: selectors.isLoadingSelector,
    globalMessage: selectors.globalMessageSelector
  }
), actions)(Login)
