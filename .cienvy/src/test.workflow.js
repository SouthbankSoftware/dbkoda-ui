/**
 * @Author: guiguan
 * @Date:   2017-05-15T18:35:28+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-17T00:13:26+10:00
 */

import cleanup from './cleanup.workflow';

export default (app, cwd, helpers) => {
  return helpers
    .exec('yarn test')
    .then(() => cleanup(app, cwd, helpers))
    .catch(() => cleanup(app, cwd, helpers).then(() => Promise.reject(1)));
};
