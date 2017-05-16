'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cleanup = require('./cleanup.workflow');

var _cleanup2 = _interopRequireDefault(_cleanup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app, cwd, helpers) {
  return helpers.exec('yarn test').then(function () {
    return (0, _cleanup2.default)(app, cwd, helpers);
  }).catch(function () {
    return (0, _cleanup2.default)(app, cwd, helpers).then(function () {
      return Promise.reject(1);
    });
  });
}; /**
    * @Author: guiguan
    * @Date:   2017-05-15T18:35:28+10:00
    * @Last modified by:   guiguan
    * @Last modified time: 2017-05-17T00:13:26+10:00
    */

module.exports = exports['default'];
//# sourceMappingURL=test.workflow.js.map