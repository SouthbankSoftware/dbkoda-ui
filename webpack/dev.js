/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-07T16:49:05+10:00
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./common');

module.exports = merge.strategy({
  entry: 'prepend',
  'module.rules': 'prepend',
  plugins: 'prepend'
})(common, {
  entry: [
    // activate HMR for React
    'react-hot-loader/patch',

    // bundle the client for webpack-dev-server and connect to the provided endpoint
    'webpack-dev-server/client?http://localhost:3000',

    // bundle the client for hot reloading only- means to only hot reload for
    // successful updates
    'webpack/hot/only-dev-server'
  ],
  module: {
    rules: [
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
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    // enable HMR globally
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ]
});
