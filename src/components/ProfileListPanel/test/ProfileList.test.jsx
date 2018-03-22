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
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-22T17:11:16+11:00
*/

import React from 'react';
import {shallow, mount} from 'enzyme';
import {useStrict} from 'mobx';
import Store from '~/stores/global';
import {ProfileListPanel, ProfileListToolbar, ProfileListView} from '../index.js';

describe('Profile List Panel', () => {
  let app;

  beforeAll(() => {
    useStrict(true);
    const store = new Store();
    app = shallow(<ProfileListPanel.wrappedComponent store={store} />);
  });

  test('has a toolbar', () => {
    expect(app.find('inject-Toolbar-with-store').length).toEqual(1);
  });

  test('has a listView', () => {
    expect(app.find('inject-ListView-with-store').length).toEqual(1);
  });
});

describe('Profile List Toolbar', () => {
  let app;

  beforeAll(() => {
    useStrict(true);
    const store = new Store();
    app = mount(<ProfileListToolbar.wrappedComponent store={store} />);
  });

  test('has buttons', () => {
    expect(app.find('AnchorButton').length).toEqual(4);
  });

  test('has disabled buttons', () => {
    expect(app.find('.editProfileButton').prop('disabled'));
    expect(app.find('.removeProfileButton').prop('disabled'));
  });

  test('has a search bar', () => {
    expect(app.find('input').length).toEqual(1);
  });
});


describe('Profile List View', () => {
  let app;

  beforeAll(() => {
    useStrict(true);
    const store = new Store();
    app = mount(<ProfileListView.wrappedComponent store={store} />);
  });

  test('has a table', () => {
    expect(app.find('Table').length).toEqual(1);
  });

  test('has a single column', () => {
    expect(app.find('ColumnHeaderCell').length).toEqual(1);
  });

  test('has a Connection Profiles column', () => {
    expect(app.find('.pt-table-truncated-text').text()).toEqual('Connection Profiles');
  });
});
