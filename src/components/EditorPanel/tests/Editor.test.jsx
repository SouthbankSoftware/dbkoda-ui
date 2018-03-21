/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-14 15:54:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-21T11:01:51+11:00
 *
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

import React from 'react';
import '~/helpers/configEnzyme';
import { shallow, mount } from 'enzyme';
import { useStrict } from 'mobx';
import Store from '~/stores/global';
import Profiles from '~/stores/profiles';
import DataCenter from '~/api/DataCenter';
import globalizeInit from '#/tests/helpers/globalize.js';
import { EditorPanel, EditorToolbar } from '../index.js';

describe('Editor Panel', () => {
  let app;

  beforeAll(() => {
    useStrict(true);
    globalizeInit();
    const store = new Store();
    const profileStore = new Profiles();
    const api = new DataCenter(store, profileStore);
    app = shallow(<EditorPanel.wrappedComponent store={store} api={api} profileStore={profileStore} />);
  });

  test('has tabs', () => {
    expect(app.find('Tabs').length).toEqual(1);
  });

  test('has a toolbar', () => {
    expect(app.find('inject-Toolbar').length).toEqual(1);
  });
});

describe('Toolbar', () => {
  let app;
  let store;
  let profileStore;
  let api;

  beforeAll(() => {
    useStrict(false);
    store = new Store();
    profileStore = new Profiles();
    api = new DataCenter(store, profileStore);
    app = mount(<EditorToolbar.wrappedComponent store={store} api={api} profileStore={profileStore} />);
  });

  test('has buttons', () => {
    expect(app.find('AnchorButton').length).toEqual(7);
  });

  test('has disabled buttons', () => {
    expect(app.find('.executeLineButton').at(0).prop('disabled'));
    expect(app.find('.executeAllButton').at(0).prop('disabled'));
    expect(app.find('.explainPlanButton').at(0).prop('disabled'));
    expect(app.find('.stopExecutionButton').at(0).prop('disabled'));
  });

  test('has a dropdown', () => {
    expect(app.find('select').length).toEqual(1);
  });
});
