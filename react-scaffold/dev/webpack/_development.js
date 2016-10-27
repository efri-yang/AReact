/* eslint key-spacing:0 */
import webpack from 'webpack'
import config from '../config'
import _debug from 'debug'

const { utils_paths: paths } = config
const debug = _debug('app:webpack:development')

export default webpackConfig => {
  debug('Enable eslint preLoader.')
  webpackConfig.module.preLoaders = [{
    test: /\.(js|jsx)$/,
    loader: 'eslint',
    include: /app/,
    exclude: /app\/static/
  }]

  debug('Enable Hot Module Replacement (HMR).')
  webpackConfig.entry.app.push(
    // 'webpack-hot-middleware/client?noInfo=true&reload=true'
    'webpack-hot-middleware/client?path=/__webpack_hmr'
  )

  debug('Enable plugins for live development (HMR, NoErrors).')
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  )

  return webpackConfig
}
