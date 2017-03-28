import React from 'react';
import {mount} from 'enzyme';
import {useStrict} from 'mobx';
import chai, {expect} from 'chai';
import {Provider} from 'mobx-react';
import chaiEnzyme from 'chai-enzyme'
import Store from '../../../stores/global';
import Panel from '../Panel';
import {createForm} from '../ProfileForm';

chai.use(chaiEnzyme());

describe('New Connection Profile Panel', () => {

  it('test new connection with default form values', () => {
    let store = new Store();
    let form = createForm();
    const app = mount(<Provider store={store}>
      <Panel form={form}/>
    </Provider>);
    expect(app.find('.host-input')).to.be.disabled();
    expect(app.find('.port-input')).to.be.disabled();
    expect(app.find('.url-input')).to.not.be.disabled();
    expect(app.find('.username-input')).to.be.disabled();
    expect(app.find('.password-input')).to.be.disabled();
  });

  it('test new connection with authentication enabled', () => {
    let store = new Store();
    let form = createForm({sha: true});
    const app = mount(<Provider store={store}>
      <Panel form={form}/>
    </Provider>);
    expect(app.find('.username-input')).to.not.be.disabled();
    expect(app.find('.password-input')).to.not.be.disabled();
  });

  it('test new connection with hostname enabled', () => {
    let store = new Store();
    let form = createForm({hostRadio: true});
    const app = mount(<Provider store={store}>
      <Panel form={form}/>
    </Provider>);
    expect(app.find('.host-input')).to.not.be.disabled();
    expect(app.find('.port-input')).to.not.be.disabled();
    expect(app.find('.url-input')).to.be.disabled();
  });
});