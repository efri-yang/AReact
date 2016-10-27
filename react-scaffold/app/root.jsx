import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import commonStyles from 'theme/styles'

@connect(state => ({language: state.language}))
export default class extends React.Component {
  static childContextTypes = {
    language: PropTypes.string
  }

  getChildContext() {
    return {
      language: this.props.language
    }
  }

  render() {
    const children = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {language: this.props.language})
    })

    return (
      <div className={commonStyles['middle-center']}>
        {children}
      </div>
    )
  }
}
