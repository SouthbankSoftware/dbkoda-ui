import React from 'react';
import {inject, observer} from 'mobx-react';
import validatorjs from 'validatorjs';
import {Radio} from '@blueprintjs/core';
import forms from './Form';
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
            <Radio className="pt-form-group"/>
            <Input field={form.$('host')}/>
            <Input field={form.$('port')}/>
          </div>
          <div className="profile-input-row">
            <Radio className="pt-form-group"/>
            <Input field={form.$('url')}/>
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

