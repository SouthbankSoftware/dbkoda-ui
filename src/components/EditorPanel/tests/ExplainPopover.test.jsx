/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-14 15:54:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T12:44:44+10:00
 */

import React from 'react';
import {mount} from 'enzyme';
import {useStrict} from 'mobx';
import Store from '~/stores/global';
import globalizeInit from '#/tests/helpers/globalize.js';
import {expect} from 'chai';
import {ExplainPopover} from '../index.js';

describe('Explain Toolbar Test', () => {
  let app;
  let store;

  beforeAll(() => {
    useStrict(false);
    globalizeInit();
    store = new Store();
    app = mount(<ExplainPopover editorToolbar={store.editorToolbar} editorPanel={store.editorPanel} />);
  });

  test('has explain menu items', () => {
    expect(app.find('.explainPopover')).to.have.length(1);
  });
});
