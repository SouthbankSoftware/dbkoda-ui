/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T10:47:14+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-30T14:14:58+11:00
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
import { useStrict } from 'mobx';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import globalizeInit from '#/tests/helpers/globalize.js';
import Store from '~/stores/global';
import Config from '~/stores/config';
import Profiles from '~/stores/profiles';
import ConnectionPanel from '../ConnectionPanel';
import Label from '../Label';

describe.skip('New Profile Panel', () => {
  let app;

  beforeAll(() => {
    globalizeInit();
    useStrict(true);
    const store = new Store();
    const config = new Config();
    const profileStore = new Profiles();
    app = mount(
      <Provider store={store} config={config} profileStore={profileStore}>
        <ConnectionPanel />
      </Provider>,
    );
  });

  it('form field exist', () => {
    expect(app.contains(<ConnectionPanel />)).to.equal(true);
    expect(app.find('.profile-form')).to.have.length(1);
  });

  it('alias exist', () => {
    expect(app.find('.alias-label')).to.have.length(1);
  });

  it('database exist', () => {
    expect(app.find('.database-label')).to.have.length(1);
  });

  it('authentication exist', () => {
    expect(app.contains(<Label text="Authentication" />)).to.equal(true);
  });

  it('host radio exist', () => {
    expect(app.find('.hostRadio-radio-input')).to.have.length(3);
  });
});
