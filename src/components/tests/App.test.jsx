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
* @Author: Chris Trott <chris>
* @Date:   2017-03-03T09:47:22+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T16:13:46+10:00
*/

import '~/stores/global';
import React from 'react';
import { shallow } from 'enzyme';
import { observable, useStrict } from 'mobx';
import globalizeInit from '#/tests/helpers/globalize.js';
import App from '#/App';

describe('App', () => {
  let app;
  const layout = observable({
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%',
  });

  beforeAll(() => {
    useStrict(true);
    globalizeInit();
    app = shallow(<App.wrappedComponent layout={layout} />);
  });

  test('has 2 split panels', () => {
    expect(app.find('SplitPane').length).toEqual(2);
  });
});
