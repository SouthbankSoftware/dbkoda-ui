/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-22 17:04:19
*/

import React from 'react';
import {shallow, mount} from 'enzyme';
import {useStrict} from 'mobx';
import Store from '~/stores/global';
import {EditorPanel, EditorToolbar} from '../index.js';

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
    expect(app.find('AnchorButton').length).toEqual(7);
  });

  test('has disabled buttons', () => {
    expect(app.find('.executeLineButton').prop('disabled'));
    expect(app.find('.executeAllButton').prop('disabled'));
    expect(app.find('.explainPlanButton').prop('disabled'));
    expect(app.find('.stopExecutionButton').prop('disabled'));
  });

  test('has a dropdown', () => {
    expect(app.find('select').length).toEqual(1);
  });

  test('has a search bar', () => {
    expect(app.find('input').length).toEqual(1);
  });
});
