/* eslint key-spacing:0 */
import cssnano from 'cssnano'

export default webpackConfig => {
  webpackConfig.devtool = 'cheap-module-source-map'
  webpackConfig.resolve.alias.sinon = 'sinon/pkg/sinon.js'
  webpackConfig.module.noParse = [/\/sinon\.js/]
  webpackConfig.module.loaders.push({
    test: /sinon(\\|\/)pkg(\\|\/)sinon\.js/,
    loader: 'imports?define=>false,require=>false'
  })
  webpackConfig.externals = {
    ...webpackConfig.externals,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': 'window',
    'text-encoding': 'window'
  }
  webpackConfig.postcss = function (webpack) {
    return [
      require('postcss-easy-import')({
        glob: true,
        addDependencyTo: webpack
      }),
      require('postcss-url'),
      require('postcss-each'),
      require('precss')(),
      cssnano({
        filterPlugins: false,
        sourcemap: true,
        autoprefixer: {
          add: true,
          remove: true,
          browsers: ['last 2 versions']
        },
        safe: true,
        discardComments: {
          removeAll: true
        }
      })
    ]
  }


  return webpackConfig
}
