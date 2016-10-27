import React from 'react'
import {Decorator as FormsyElement} from 'formsy-react'
import classNames from 'classnames'
import commonStyles from 'theme/styles'

@FormsyElement()
export default class Input extends React.Component {
  changeValue(e) {
    this.props.setValue(e.currentTarget.value)
  }

  componentDidMount() {
    // safari autofill not fire change event fix
    let retry = 0
    this.timer = setInterval(() => {
      const value = this.el.value

      if (retry === 5) clearInterval(this.timer)

      if (value) {
        const evt = document.createEvent('HTMLEvents')
        evt.initEvent('input', true, true)
        this.el.dispatchEvent(evt)
        clearInterval(this.timer)
      }
      retry++
    }, 20)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {
    const { name, icon, type = 'text', placeholder } = this.props

    const classes = classNames('form-item', this.props.className, {
      required: this.props.showRequired(),
      error: this.props.showError(),
      success: this.props.isValid()
    })

    // An error message is returned ONLY if the component is invalid
    // or the server has returned an error message
    // const errorMessage = this.props.getErrorMessage()

    return (
      <div className={classes}>
        <i className={commonStyles[`icon-${icon}`]}/>
        <input
          ref={(c) => { this.el = c }}
          type={type}
          name={name}
          placeholder={placeholder}
          onChange={::this.changeValue}
          value={this.props.getValue()}
        />
      </div>
    )
  }
}
