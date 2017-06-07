/**
 * @Author: guiguan
 * @Date:   2017-06-07T10:53:23+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-07T17:17:56+10:00
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const merge = require('webpack-merge');
const prod = require('./prod');

module.exports = merge.strategy({
  plugins: 'append'
})(prod, {
  plugins: [new BundleAnalyzerPlugin()]
});
