'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @Author: guiguan
 * @Date:   2017-05-14T17:04:16+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-15T18:33:47+10:00
 */

exports.default = function (app, cwd, helpers) {
  return helpers.exec('yarn install');
};

module.exports = exports['default'];
//# sourceMappingURL=install.workflow.js.map