import webpack from 'webpack'
import cssnano from 'cssnano'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import config from '../config'
import _debug from 'debug'

const { utils_paths: paths, dir_client: app, globals: {__DEV__} } = config
const debug = _debug('app:webpack:_base')

debug('Create configuration.')

const webpackConfig = {
  name: 'client',
  target: 'web',
  devtool: config.compiler_devtool,
  resolve: {
    root: paths.base(app),
    extensions: ['', '.js', '.jsx', '.css', '.json'],
    alias: config.aliases
  },
  entry: {
    app: [
      paths.client('entry.jsx')
    ],
    vendor: config.compiler_vendor
  },
  output: {
    filename: `[name].[${config.compiler_hash_type}].js`,
    chunkFilename: `[id].[chunkhash].js`,
    path: paths.base(config.dir_dist),
    publicPath: config.compiler_public_path
  },
  plugins: [
    new webpack.DefinePlugin(config.globals),
    new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(zh-cn|zh-tw)$/),
    new HtmlWebpackPlugin({
      title: 'Web-IM',
      template: paths.client('index.html'),
      hash: false,
      favicon: paths.client('static/logo.png'),
      filename: 'index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          plugins: ['transform-runtime', 'add-module-exports', 'transform-decorators-legacy'],
          presets: ['es2015', 'react', 'stage-0'],
          env: {
            development: {
              plugins: [
                ['react-transform', {
                  transforms: [{
                    transform: 'react-transform-hmr',
                    imports: ['react'],
                    locals: ['module']
                  }, {
                    transform: 'react-transform-catch-errors',
                    imports: ['react', 'redbox-react']
                  }]
                }]
              ]
            },
            production: {
              plugins: [
                'transform-react-remove-prop-types',
                'transform-react-constant-elements'
              ]
            }
          }
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.css$/,
        include: /app/,
        loaders: [
          'style',
          `css?${JSON.stringify({
            sourceMap: __DEV__,
            modules: true,
            importLoaders: 1,
            localIdentName: __DEV__ ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:10]',
            minimize: false
          })}`,
          'postcss'
        ]
      },
      {
        test: /\.css$/,
        exclude: /app/,
        loaders: [
          'style',
          'css',
          'postcss'
        ]
      },
      {
        test: /\.(png|jpg|gif|ico)$/,
        loaders: [`file?name=images/[name]_[hash:base64:5].[ext]`]
      },
      {
        test: /\.mp3$/,
        loaders: [`file?name=media/[hash].[ext]`]
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?.*)?$/,
        loader: `file?name=fonts/[name]_[hash:base64:5].[ext]`
      }
    ]
  },
  postcss: function plugins(webpack) {
    return [
      require('postcss-easy-import')({
        glob: true,
        addDependencyTo: webpack
      }),
      require('postcss-url'),
      require('postcss-each'),
      require('precss')(),
      require('postcss-browser-reporter')({
        styles: {
          display: __DEV__ ? 'block' : 'none',
          'z-index': 1000,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '1.5em 1em 1.5em 4.5em',
          color: '#fff',
          'background-color': '#df4f5e'
        }
      }),
      require('postcss-reporter')({
        filter: msg => {
          return !/skip data:image\/.+;base64,/.test(msg.text)
        }
      }),
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
  },
  eslint: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: false
  }
}

export default webpackConfig
