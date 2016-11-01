import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'
import App from '../Modules/App'
import About from '../Modules/About'
import Inbox from '../Modules/Inbox'
import Message from '../Modules/Message'

render((
	<Router history={hashHistory}>
		<Route path="/" component={App}>
			<Route path='/about'  component={About} />
			<Route path='/inbox' component={Inbox}>
				<Route path='message/:id' component={Message} />
			</Route>
		</Route>
	</Router>
), document.getElementById('app'))