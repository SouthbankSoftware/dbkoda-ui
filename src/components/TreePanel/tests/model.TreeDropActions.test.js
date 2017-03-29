/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-29T12:56:35+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-29T15:05:55+11:00
 */


/**
 * [treeNode description]
 * To run this test first you have to precompile the handlebar templates.
 * Follow the following steps:
 * 1 - install handlebars globally using `npm install handlebars -g`
 * 2 - run the following command in the templates directory `handlebars dragdrop/*.hbs -f dragdrop.templates.js`
 */

import TreeDropActions from '#/TreePanel/model/TreeDropActions';

describe('TreeState', () => {
  const treeNode = { type: 'config', label: 'localhost:37017'};

  test('should generate context for passing to template', () => {
    const context = TreeDropActions.getContext(treeNode);
    expect(context.host).toEqual('localhost');
    expect(context.port).toEqual('37017');
  });
});
