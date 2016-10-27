import Route from 'react-router/lib/Route'
import auth from 'utils/auth'

/**
 * Webpack code splitting, load on demand
 * @param component
 */
const asyncLoad = component => (location, cb) => {
  require(`bundle?!../modules/${component}`)(function (c) {
    cb(null, c)
  })
}

/**
 * Go through the routes, add auth check function
 * @param routes react-router config
 * @param cb {function} callback
 * @returns {object} routes object
 */
const walk = (routes, cb) => {
  cb(routes)

  if (routes.childRoutes) {
    routes.childRoutes.forEach(route => {
      if (routes.requireAuth) {
        if (route.requireAuth === undefined) {
          route.requireAuth = routes.requireAuth
        }

        if (!route.roles && routes.roles) {
          route.roles = routes.roles
        }
      }
      walk(route, cb)
    })
  }

  return routes
}

const forwardHomeIfLoggedIn = (nextState, replace) => {
  if (auth.isLogin()) {
    replace('/')
  }
}

const withAuth = routes => {
  return walk(Route.createRouteFromReactElement(routes), route => {
    const oldOnEnter = route.onEnter

    if (route.comp) {
      route.getComponent = asyncLoad(route.comp)
    }

    if (route.indexRoute) {
      route.indexRoute.getComponent = asyncLoad(route.indexRoute.comp)
    }

    route.onEnter = (nextState, replace) => {
      if (route.requireAuth) {
        if (!auth.isLogin()) {
          return replace({
            pathname: '/login',
            state: {
              nextPathname: nextState.location.pathname
            }
          })
        }

        if (!auth.hasAuth(route.roles)) {
          return replace('/403')
        }
      }

      oldOnEnter && oldOnEnter(nextState, replace)
    }
  })
}

export {
  asyncLoad,
  walk,
  withAuth,
  forwardHomeIfLoggedIn
}
