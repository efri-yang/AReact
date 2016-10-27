import 'rc-select/assets/index.css'
import './styles'

import React from 'react'
import { connect } from 'react-redux'
import i18n from 'i18n'
import Select, { Option } from 'rc-select'
import { LANGUAGES } from 'constants'
import { changeLanguage } from '../../actions'

class LangSelect extends React.Component {
  static propTypes = {
    width: React.PropTypes.number
  }

  render() {
    let dropdownAlign = {
      offset: [0, 0]
    }
    return (
      <Select
        showSearch={false}
        style={{ width: this.props.width }}
        animation="slide-up"
        dropdownAlign={dropdownAlign}
        optionLabelProp="children"
        dropdownClassName="language-dropdown"
        value={this.props.language}
        onChange={::this.handleChange}>
        {
          LANGUAGES.map(lang =>
            <Option
              key={lang}
              value={lang}
              title={i18n.t(`language.${lang}`)}>
              {i18n.t(`language.${lang}`)}
            </Option>)
        }
      </Select>
    )
  }

  handleChange(lang) {
    i18n.changeLanguage(lang)
  }
}

export default connect(
  state => ({language: state.language}),
  {changeLanguage}
)(LangSelect)
