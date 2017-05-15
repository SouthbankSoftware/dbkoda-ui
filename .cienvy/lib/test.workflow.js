'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _default = function _default(app, cwd, helpers) {
  return helpers.exec('yarn test');
};

/**
 * @Author: guiguan
 * @Date:   2017-05-15T18:35:28+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-15T18:43:24+10:00
 */

exports.default = _default;
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(_default, 'default', '.cienvy/src/test.workflow.js');
}();

;
//# sourceMappingURL=test.workflow.js.map