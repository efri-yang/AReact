import React, { Component, PropTypes } from 'react'
import i18n from 'i18n'

class Interpolate extends Component {
  static propTypes = {
    i18nKey: PropTypes.string.isRequired,
    ns: PropTypes.string
  }

  render() {
    const parent = this.props.parent || 'span'
    const REGEXP = this.props.regexp || i18n.services.interpolator.regexp

    let tOpts = {...{}, ...this.props.options, ...{interpolation: {prefix: '#$?', suffix: '?$#'}}}
    let format = i18n.t(this.props.i18nKey, tOpts)

    if (!format || typeof format !== 'string') return React.createElement('noscript', null)

    let children = []

    format.split(REGEXP).reduce((memo, match, index) => {
      var child

      if (index % 2 === 0) {
        if (match.length === 0) return memo
        child = match
      } else {
        child = this.props[match]
      }

      memo.push(child)
      return memo
    }, children)

    return React.createElement.apply(this, [parent, this.props].concat(children))
  }
}

export default Interpolate
