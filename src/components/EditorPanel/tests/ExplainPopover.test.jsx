/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-14 15:54:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-28 16:22:13
 */

import React from 'react';
import {mount} from 'enzyme';
import {useStrict} from 'mobx';
import Store from '~/stores/global';
import {assert, expect} from 'chai';
import {ExplainPopover} from '../index.js';


describe('Explain Toolbar Test', () => {
  let app;
  let store;

  beforeAll(() => {
    useStrict(false);
    store = new Store();
    app = mount(<ExplainPopover editorToolbar={store.editorToolbar} editorPanel={store.editorPanel} />);
  });

  test('has explain menu items', () => {
    expect(app.find('.explainPopover')).to.have.length(1);
  });


});

