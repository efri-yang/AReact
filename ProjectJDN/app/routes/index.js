import React, { Component } from 'react'

import Router from 'react-router/lib/Router'
import Route from 'react-router/lib/Route'
import IndexRoute from 'react-router/lib/IndexRoute'
import IndexRedirect from 'react-router/lib/IndexRedirect'
import hashHistory from 'react-router/lib/hashHistory'

import { withAuth, forwardHomeIfLoggedIn } from './helpers'
import Root from 'root'

const routes = (
  <Route component={Root}>
    <Route path="login" onEnter={forwardHomeIfLoggedIn} comp="account/components/login/index"/>
    <Route path="logout" comp="account/components/logout" />
    <Route path="/" requireAuth comp="home/components/index">
      <IndexRedirect to="/msg" />
      <Route path="msg" comp="message/components/index">
        <IndexRoute comp="message/components/welcome/index"/>
        <Route path="chat" comp="message/components/chat/index" />
      </Route>
      <Route path="contacts" comp="contacts/components/index">
        <IndexRoute comp="contacts/components/welcome/index"/>
        <Route path="chat" comp="message/components/chat/index" />
      </Route>
      <Route path="cloud" comp="cloud/components/index" />
      <Route path="apps" comp="applist/components/index" />
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
