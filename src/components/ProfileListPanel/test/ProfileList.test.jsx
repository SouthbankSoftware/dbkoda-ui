/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-14 15:54:27
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
    expect(app.find('.bp-table-truncated-text').text()).toEqual('Connection Profiles');
  });
});

