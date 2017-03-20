import React from 'react';
import {inject, observer, action} from 'mobx-react';
import validatorjs from 'validatorjs';
import autobind from 'autobind-decorator';
import forms from './Form';
import Radio from './Radio';
import Input from './Input';
import Checkbox from './Checkbox';
import ProfileForm from './ProfileForm';
import './style.scss';

@inject('store')
@observer
export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.form = new ProfileForm({fields: forms.fields}, {plugins: {dvr: validatorjs}});
    this.form.observe({
      path: 'hostRadio',
      key: 'value', // can be any field property
      call: ({form, field, change}) => {
        console.log('xxx')
      },
    })

  }

  @autobind
  hostRadioOnChange(){
    this.form.$('hostRadio').set('value', !this.form.$('hostRadio').get('value'));
    this.form.$('urlRadio').set('value', !this.form.$('urlRadio').get('value'));
  }

  render() {
    const form = this.form;
    return (
      <div className="pt-dark ">
        <h3 className="profile-title">Create New Connection</h3>
        <form className="profile-form" onSubmit={form.onSubmit}>
          <div className="profile-input-row">
            <Input field={form.$('alias')}/>
          </div>
          <div className="profile-input-row">
            <Radio field={form.$('hostRadio')} onChange={this.hostRadioOnChange}/>
            <Input field={form.$('host')} showLabel={false} disable={!form.$('hostRadio').get('value')}/>
            <Input field={form.$('port')} showLabel={false} disable={!form.$('hostRadio').get('value')}/>
          </div>
          <div className="profile-input-row">
            <Radio field={form.$('urlRadio')} onChange={this.hostRadioOnChange}/>
            <Input field={form.$('url')} showLabel={false} disable={!form.$('urlRadio').get('value')}/>
          </div>
          <div className="profile-input-row">
            <Input field={form.$('database')}/>
            <Checkbox field={form.$('ssl')}/>
          </div>
          <div className="profile-separator"/>
          <label className="pt-label .modifier">
            Authentication
          </label>
          <div className="profile-input-row">
            <Checkbox field={form.$('sha')}/>
          </div>
          <div className="profile-input-row">
            <Input field={form.$('username')}/>
          </div>
          <div className="profile-input-row">
            <Input field={form.$('password')}/>
          </div>
          {/*<button type="submit" onClick={form.onSubmit}>Submit</button>*/}
          {/*<button type="button" onClick={form.onClear}>Clear</button>*/}
          {/*<button type="button" onClick={form.onReset}>Reset</button>*/}
          <p>{form.error}</p>
        </form>
      </div>

    );
  }


}

