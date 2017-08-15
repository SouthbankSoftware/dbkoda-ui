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
 *
 * @Author: chris
 * @Date:   2017-08-10T13:30:31+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-08-14T15:04:49+10:00
 */

import React from 'react';
import { mount } from 'enzyme';
import { useStrict } from 'mobx';
import globalizeInit from '#/tests/helpers/globalize.js';
import Panel from '../Panel';

describe('Enhanced JSON Tab', () => {
  let app;
  const testJson = { 'json': {'key': 'value'} };
  console.log(Panel);

  beforeAll(() => {
    useStrict(true);
    globalizeInit();
    app = mount(<Panel enhancedJson={testJson} />);
  });

  test('can render', () => {
    expect(app.find('.react-json-view').length).toEqual(1);
  });
});
