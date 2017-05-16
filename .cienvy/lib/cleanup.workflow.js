'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @Author: guiguan
 * @Date:   2017-05-16T23:50:26+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T23:50:45+10:00
 */

exports.default = function (app, cwd, helpers) {
  return helpers.exec('rm -rf data');
};

module.exports = exports['default'];
//# sourceMappingURL=cleanup.workflow.js.map