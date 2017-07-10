'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @Author: guiguan
 * @Date:   2017-05-14T17:04:16+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-17T21:53:42+10:00
 */

exports.default = function (app, cwd, helpers) {
  return helpers.exec('yarn install --no-progress');
};

module.exports = exports['default'];
//# sourceMappingURL=install.workflow.js.map