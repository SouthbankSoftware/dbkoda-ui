/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T10:47:14+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T15:34:15+10:00
 */

import React from 'react';
import {mount} from 'enzyme';
import {useStrict} from 'mobx';
import {expect} from 'chai';
import {Provider} from 'mobx-react';
import globalizeInit from '#/tests/helpers/globalize.js';
import Store from '../../../stores/global';
import ConnectionPanel from '../ConnectionPanel';
import Label from '../Label';

describe('New Profile Panel', () => {
  let app;

  beforeAll(() => {
    globalizeInit();
    useStrict(true);
    const store = new Store();
    app = mount(<Provider store={store}>
      <ConnectionPanel />
    </Provider>);
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
    expect(app.find('.hostRadio-radio-input')).to.have.length(2);
  });
});
