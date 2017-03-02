const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = (() => {

  return {
    entry: [
      "./src/index.jsx"
    ],
    output: {
      path: path.join(__dirname, "../dist/"),
      publicPath: "/",
      filename: "app.[hash].js"
    },
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.scss|css$/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: ["css-loader", 'sass-loader'],
            publicPath: "styles/bundle.css"
          })
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            "file-loader?hash=sha512&digest=hex&name=assets/[hash].[ext]",
            "image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false"
          ]
        },
        {
          test: /\.(png|svg|woff|eot|ttf|woff2)(\?.*$|$)/,
          loader: "url-loader?limit=100000&mimetype=application/font-woff"
        },
        {test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?name=images/[hash].[ext]"},
      ]
    },
    plugins: getPlugins()
  };
});

const getPlugins = () => {

  return [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({hash: false, template: "./src/index.html"}),
    new ExtractTextPlugin({
      filename: "styles/bundle.css",
      disable: false,
      allChunks: true
    }),
  ];

}


module.exports = config();
