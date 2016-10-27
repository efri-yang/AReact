import React from 'react'
import {connect} from 'react-redux'
import * as actions from '../actions'
import {Scrollbars} from 'react-custom-scrollbars'
import Category from './category.jsx'

class AppBox extends React.Component {

  componentDidMount() {
    this.props.getApps()
  }

  render() {
    let {categories} = this.props.apps
    let appList = categories ? categories.map(function (category) {
      return (
        <Category
          key={category['category_name']}
          name={category['category_name']}
          items={category.items}
        />
      )
    }) : null

    return (
      <Scrollbars
        style={{height: '100%', background: '#fff'}}
      >
        {appList}
      </Scrollbars>
    )
  }
}

export default connect(state => ({
  apps: state.apps
}), actions)(AppBox)
