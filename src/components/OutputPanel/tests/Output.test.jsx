/**
 * @Author: chris
 * @Date:   2017-03-10T10:55:54+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-21T13:22:27+11:00
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

import 'raf/polyfill';
import ReactDOM from 'react-dom';
import React from 'react';
import { JSDOM } from 'jsdom';
import { assert } from 'chai';
import { Provider } from 'mobx-react';
import Store from '~/stores/global';
import globalizeInit from '#/tests/helpers/globalize.js';
import { OutputToolbar } from '../index.js';

describe('Output Toolbar', () => {
  let document;
  let window;
  let store;
  const OutputToolbarWrapper = function OutputToolbarWrapper(props) {
    return (
      <Provider store={props.store}>
        <OutputToolbar title="Test" />
      </Provider>
    );
  };

  beforeAll(() => {
    globalizeInit();
    ({ window } = new JSDOM('<div id="container"></div>'));
    ({ document } = window);
    store = new Store();
  });

  beforeEach(() => {
    store.outputs.set('Test', {
      id: 1,
      title: 'Test',
      output: '',
      cannotShowMore: true,
      showingMore: false
    });
    store.outputPanel.currentTab = 'Test';
  });

  test('should have an enabled showMoreBtn when cannotShowMore is false', () => {
    store.outputs.get('Test').cannotShowMore = false;
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
    assert(!document.querySelector('.showMoreBtn').hasAttribute('disabled'));
  });

  test('should have a disabled showMoreBtn when cannotShowMore is true', () => {
    store.outputs.get('Test').cannotShowMore = true;
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
    assert(document.querySelector('.showMoreBtn').hasAttribute('disabled'));
  });

  test('should have a clearOutputBtn', () => {
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
    assert(document.querySelector('.clearOutputBtn'));
  });

  test('should have a saveOutputBtn', () => {
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
    assert(document.querySelector('.saveOutputBtn'));
  });
});
