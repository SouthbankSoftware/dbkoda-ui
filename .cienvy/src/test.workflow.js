/**
 * @Author: guiguan
 * @Date:   2017-05-15T18:35:28+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-19T11:54:52+10:00
 */

export default (app, cwd, helpers) => {
  return helpers.exec('yarn test');
};
