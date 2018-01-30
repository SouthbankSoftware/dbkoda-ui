/**
 * @Author: chris
 * @Date:   2017-04-21T10:59:57+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-30T14:15:22+11:00
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
import { mount } from 'enzyme';
import chai, { expect } from 'chai';
import { Provider } from 'mobx-react';
import chaiEnzyme from 'chai-enzyme';
import globalizeInit from '#/tests/helpers/globalize.js';
import Store from '../../../stores/global';
import Panel from '../Panel';
import { createForm } from '../ProfileForm';

chai.use(chaiEnzyme());

describe.skip('New Connection Profile Panel', () => {
  beforeAll(() => {
    globalizeInit();
  });

  it('test new connection with authentication enabled', () => {
    const store = new Store();
    const form = createForm({ sha: true });
    const app = mount(
      <Provider store={store}>
        <Panel form={form} />
      </Provider>,
    );
    expect(app.find('.username-input')).to.not.be.disabled();
    expect(app.find('.password-input')).to.not.be.disabled();
  });

  it('test new connection with hostname enabled', () => {
    const store = new Store();
    const form = createForm({ hostRadio: true });
    const app = mount(
      <Provider store={store}>
        <Panel form={form} />
      </Provider>,
    );
    expect(app.find('.host-input')).to.not.be.disabled();
    expect(app.find('.port-input')).to.not.be.disabled();
  });

  it('test new connection with hostname disabled', () => {
    const store = new Store();
    const form = createForm({ hostRadio: false, urlRadio: true });
    const app = mount(
      <Provider store={store}>
        <Panel form={form} />
      </Provider>,
    );
    expect(app.find('.url-input')).to.not.be.disabled();
  });
});
