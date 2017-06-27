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
