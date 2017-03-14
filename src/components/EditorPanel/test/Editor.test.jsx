/**
* @Author: Michael Harrison <Mike>
* @Date:   2017-03-03T09:47:22+11:00
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2017-03-14T14:36:52+11:00
*/

import React from 'react';
import { shallow, mount } from 'enzyme';
import { useStrict } from 'mobx';
import Store from '~/stores/global';
import { EditorPanel, EditorToolbar, EditorView } from '../index.js';

describe('Editor Panel', () => {
  let app;

  beforeAll(() => {
    useStrict(true);
    const store = new Store();
    app = shallow(<EditorPanel.wrappedComponent store={store} />);
  });

  test('has tabs', () => {
    expect(app.find('Tabs2').length).toEqual(1);
  });

   test('has a toolbar', () => {
    expect(app.find('inject-Toolbar-with-store').length).toEqual(1);
  });
});

describe('Toolbar', () => {
  let app;

  beforeAll(() => {
    useStrict(true);
    const store = new Store();
    app = mount(<EditorToolbar.wrappedComponent store={store} />);
  });

  test('has buttons', () => {
    expect(app.find('Button').length).toEqual(7);
  });

   test('has a dropdown', () => {
    expect(app.find('select').length).toEqual(1);
  });

   test('has a search bar', () => {
    expect(app.find('input').length).toEqual(1);
  });
});
