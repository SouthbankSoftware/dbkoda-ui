/**
 * @Author: guiguan
 * @Date:   2017-03-06T16:22:54+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-07T16:57:35+11:00
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const getPlugins = () => {
  return [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({hash: false, template: './src/index.html'}),
    new ExtractTextPlugin({
      filename: 'styles/bundle.css',
      disable: false,
      allChunks: true
    }),
  ];
};

const config = (() => {
  return {
    entry: [
      './src/index.jsx'
    ],
    output: {
      path: path.join(__dirname, '../dist/'),
      publicPath: '/',
      filename: 'app.[hash].js'
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(jsx?)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.scss|css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader'],
            publicPath: 'styles/bundle.css'
          })
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
        {test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=images/[hash].[ext]'},
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: getPlugins()
  };
});

module.exports = config();
