/**
* Setup script for testing in jsdom. Can be found in the enzyme docs at:
*   https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md
*
* @Author: Chris Trott <chris>
* @Date:   2017-03-03T11:11:42+11:00
* @Email:  chris@southbanksoftware.com
* @Last modified by:   chris
* @Last modified time: 2017-03-03T11:53:32+11:00
*/

const jsdom = require('jsdom').jsdom;

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};
