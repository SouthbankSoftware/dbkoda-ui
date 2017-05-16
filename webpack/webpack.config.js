/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T10:42:46+10:00
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  context: path.resolve(__dirname, '../src'),
  entry: [
    // activate HMR for React
    'react-hot-loader/patch',

    'babel-polyfill',
    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint
    'webpack-dev-server/client?http://localhost:3000',

    // bundle the client for hot reloading
    // only- means to only hot reload for successful updates
    'webpack/hot/only-dev-server',
    './index.jsx'
  ],
  output: {
    path: path.resolve(__dirname, '../dist/'),
    publicPath: '/',
    filename: 'app.[hash].js'
  },
  devtool: 'source-map',
  devServer: {
    // enable HMR on the server
    hot: true,

    // match the output path
    contentBase: path.resolve(__dirname, '../dist'),

    // match the output `publicPath`
    publicPath: '/',
    port: 3000,
    host: '0.0.0.0'
  },
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?hash=sha512&digest=hex&name=assets/[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test: /\.(png|svg|woff|eot|ttf|woff2)(\?.*$|$)/,
        loader: 'url-loader?limit=100000&mimetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=images/[hash].[ext]'
      },
      {
        test: /\.handlebars|hbs$/,
        loader: 'handlebars-loader?helperDirs[]=' +
          path.join(__dirname, '../src/helpers/handlebars')
      },
      {
        test: /node_modules\/JSONStream\/index\.js$/,
        use: ['shebang-loader', 'babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),

    // enable HMR globally
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({ hash: false, template: './index.html' })
  ],
  node: {
    fs: 'empty',
    module: 'empty'
  }
};
