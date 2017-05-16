/**
 * @Author: guiguan
 * @Date:   2017-05-16T23:50:26+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T23:50:45+10:00
 */

 export default (app, cwd, helpers) => {
   return helpers.exec('rm -rf data');
 };
