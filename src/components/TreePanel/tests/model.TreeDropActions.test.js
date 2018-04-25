/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

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
  const treeNode = { type: 'config', label: 'localhost:37017' };

  test('should generate context for passing to template', () => {
    const context = TreeDropActions.getContext(treeNode);
    expect(context.host).toEqual('localhost');
    expect(context.port).toEqual('37017');
  });
});
