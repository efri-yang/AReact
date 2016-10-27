import styles from './index.css'

import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import * as actions from '../actions'
import { selectors } from 'modules/shared/misc'

class Home extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
  }

  render() {
    return (
      <div className={styles.container}>
        首页
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  language: selectors.languageSelector
}), actions)(Home)
