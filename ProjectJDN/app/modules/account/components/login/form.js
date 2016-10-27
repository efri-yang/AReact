import React from 'react'
import { Form } from 'formsy-react'
import cx from 'classnames'
import * as C from '../../constants'
import Input from './input'
import styles from './styles/login'

export default class LoginForm extends React.Component {
  constructor() {
    super()
    this.state = {
      isError: false,
      errorMsg: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errorMsg) {
      this.setState({
        errorMsg: nextProps.errorMsg
      })
    }
  }

  render() {
    const { formLocale, isSubmiting } = this.props
    const { account, password } = formLocale
    const classes = cx({ error: this.state.isError })
    const buttonClasses = cx(styles.button, {
      [styles.wave]: isSubmiting
    })
    // const nameValidations = {matchRegexp: /.+@.+/}
    // validations={nameValidations}
    // validationError={account.error}
    // onChange={::this.validateForm} Form
    const errorMsg = this.state.errorMsg

    return (
      <Form onChange={::this.validateForm} onValidSubmit={::this.submit} onInvalidSubmit={::this.showError} className={classes}>
        <Input name="name" icon="account" placeholder={account.placeholder} required />
        <Input name="password" icon="password" placeholder={password.placeholder} type="password" required />
        {errorMsg && <div className="validation-error">{errorMsg}</div>}
        <button className={buttonClasses} type="submit" disabled={isSubmiting}>{formLocale.login}{isSubmiting ? '...' : ''}</button>
      </Form>
    )
  }

  submit(data) {
    const { name } = data
    if (!/.+@.+/.test(name)) {
      data.name = name + C.DEFAULT_ACCOUNT_SUFFIX
    }
    this.props.onSubmit(data)
  }

  validateForm() {
    this.setState({
      errorMsg: ''
    })
  }

  showError() {
    this.setState({
      isError: true
    })
  }
}
