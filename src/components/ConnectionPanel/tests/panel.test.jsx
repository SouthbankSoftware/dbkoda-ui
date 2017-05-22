/**
 * @Author: chris
 * @Date:   2017-04-21T10:59:57+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T16:04:00+10:00
 */

import React from 'react';
import {mount} from 'enzyme';
import chai, {expect} from 'chai';
import {Provider} from 'mobx-react';
import chaiEnzyme from 'chai-enzyme';
import globalizeInit from '#/tests/helpers/globalize.js';
import Store from '../../../stores/global';
import Panel from '../Panel';
import {createForm} from '../ProfileForm';

chai.use(chaiEnzyme());

describe('New Connection Profile Panel', () => {
  beforeAll(() => {
    globalizeInit();
  });

  it('test new connection with default form values', () => {
    const store = new Store();
    const form = createForm();
    const app = mount(<Provider store={store} globalString={globalString} >
      <Panel form={form} />
    </Provider>);
    expect(app.find('.host-input')).to.be.disabled();
    expect(app.find('.port-input')).to.be.disabled();
    expect(app.find('.url-input')).to.not.be.disabled();
    expect(app.find('.username-input')).to.be.disabled();
    expect(app.find('.password-input')).to.be.disabled();
  });

  it('test new connection with authentication enabled', () => {
    const store = new Store();
    const form = createForm({sha: true});
    const app = mount(<Provider store={store}>
      <Panel form={form} />
    </Provider>);
    expect(app.find('.username-input')).to.not.be.disabled();
    expect(app.find('.password-input')).to.not.be.disabled();
  });

  it('test new connection with hostname enabled', () => {
    const store = new Store();
    const form = createForm({hostRadio: true});
    const app = mount(<Provider store={store}>
      <Panel form={form} />
    </Provider>);
    expect(app.find('.host-input')).to.not.be.disabled();
    expect(app.find('.port-input')).to.not.be.disabled();
    expect(app.find('.url-input')).to.be.disabled();
  });


  it('test new connection with hostname disabled', () => {
    const store = new Store();
    const form = createForm({hostRadio: false, urlRadio: true});
    const app = mount(<Provider store={store}>
      <Panel form={form} />
    </Provider>);
    expect(app.find('.host-input')).to.be.disabled();
    expect(app.find('.port-input')).to.be.disabled();
    expect(app.find('.url-input')).to.not.be.disabled();
  });
});
