import React from 'react'
import { render } from 'react-dom'
import { Router, Route,browserHistory, IndexRoute, Redirect} from 'react-router'
import App from '../modules/App'
import About from '../modules/About'
import Home from '../modules/Home'
import Repos from '../modules/Repos'
import Repo from '../modules/Repo'


render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="/repos" component={Repos}/>
      <Route path="/repos/:userName/:repoName" component={Repo}/>
    
      
    </Route>
  </Router> 
), document.getElementById('app'))
