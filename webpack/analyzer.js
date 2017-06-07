/**
 * @Author: guiguan
 * @Date:   2017-06-07T10:53:23+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-07T13:57:57+10:00
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpackProdConfig = require('./webpack.prod.config');

webpackProdConfig.plugins.push(new BundleAnalyzerPlugin());

module.exports = webpackProdConfig;
