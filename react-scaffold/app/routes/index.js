import React, { Component } from 'react'

import Router from 'react-router/lib/Router'
import Route from 'react-router/lib/Route'
import hashHistory from 'react-router/lib/hashHistory'

import { withAuth } from './helpers'
import Root from 'root'

const routes = (
  <Route component={Root}>
    <Route path="/" comp="home/components/index">
      <Route path="403" comp="shared/error/components/403"/>
      <Route path="*" comp="shared/error/components/404"/>
    </Route>
  </Route>
)

export default class extends Component {
  render() {
    return (
      <Router history={hashHistory} routes={withAuth(routes)} />
    )
  }
}
