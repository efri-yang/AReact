import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import config from '../config'
import _debug from 'debug'

const debug = _debug('app:webpack:production')

export default webpackConfig => {
  debug('Apply ExtractTextPlugin to CSS loaders.')
  webpackConfig.module.loaders.filter(loader =>
    loader.loaders && loader.loaders.find(name => /css/.test(name.split('?')[0]))
  ).forEach(loader => {
    const [first, ...rest] = loader.loaders
    loader.loader = ExtractTextPlugin.extract(first, rest.join('!'))
    delete loader.loaders
  })

  debug('Apply ExtractText and UglifyJS plugins.')
  webpackConfig.plugins.push(
    new ExtractTextPlugin(`[name].[contenthash].css`, {
      allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor'],
      filename: `[name].[${config.compiler_hash_type}].js`
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['app'],
      children: true,
      minChunks: 2
    }),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        unused: true,
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        warnings: false
      },
      output: {
        comments: false
      }
    })
  )

  return webpackConfig
}
