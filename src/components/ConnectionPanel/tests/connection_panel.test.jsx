import React from 'react';
import {mount} from 'enzyme';
import {useStrict} from 'mobx';
import {assert, expect} from 'chai';
import {Provider} from 'mobx-react';
import Store from '../../../stores/global';
import ConnectionPanel from '../ConnectionPanel';
import Label from '../Label';

describe('New Profile Panel', () => {
  let app;

  before(() => {
    useStrict(true);
    const store = new Store();
    app = mount(<Provider store={store}>
      <ConnectionPanel/>
    </Provider>);
  });

  it('form field exist', () => {
    expect(app.contains(<ConnectionPanel/>)).to.equal(true);
    expect(app.find(".profile-form")).to.have.length(1);
  });

  it('alias exist', () => {
    expect(app.contains(<Label text='Alias'/>)).to.equal(true);
  });

  it('user name exist', () => {
    expect(app.contains(<Label text='User Name'/>)).to.equal(true);
  });

  it('password exist', () => {
    expect(app.contains(<Label text='Password'/>)).to.equal(true);
  });

  it('database exist', ()=>{
    expect(app.contains(<Label text='Database'/>)).to.equal(true);
  });

  it('authentication exist', ()=>{
    expect(app.contains(<Label text='Authentication' className="profile-align-left"/>)).to.equal(true);
  });

  it('host radio exist', ()=>{
    expect(app.find('.hostRadio-radio-input')).to.have.length(2);
  });


});