import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import validatorjs from 'validatorjs';
import autobind from 'autobind-decorator';
import {Intent} from '@blueprintjs/core';
import forms from './Form';
import Radio from './Radio';
import Input from './Input';
import Checkbox from './Checkbox';
import ProfileForm from './ProfileForm';
import './style.scss';
import {featherClient} from '~/helpers/feathers';
import {NewToaster} from '../common/Toaster';

@inject(allStores => ({
  layout: allStores.store.layout,
  profiles: allStores.store.profiles
}))
@observer
export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.form = new ProfileForm({fields: forms.fields}, {plugins: {dvr: validatorjs}});
    this.form.connect = this._connect;
    this.form.observe({
      path: 'hostRadio',
      key: 'value', // can be any field property
      call: ({form, field, change}) => {
        console.log('xxx')
      },
    });
  }

  @autobind
  _hostRadioOnChange() {
    this.form.$('hostRadio').set('value', !this.form.$('hostRadio').get('value'));
    this.form.$('urlRadio').set('value', !this.form.$('hostRadio').get('value'));
  }

  @action.bound
  _close() {
    this.props.layout.drawerOpen = false;
  }

  @action.bound
  _connect(form) {
    console.log('get form value ', form);
    let connectionUrl;
    if (form.hostRadio) {
      connectionUrl = 'mongodb://' + form.host + ':' + form.port;
    } else if (form.urlRadio) {
      connectionUrl = form.url;
    }
    if (form.sha) {
      let split = connectionUrl.split('mongodb://');
      connectionUrl = 'mongodb://' + form.username + ':' + form.password + '@' + split[1];
    }
    console.log('connection url ', connectionUrl);
    try {
      featherClient()
        .service('/mongo-connection')
        .create({}, {
          query: {
            url: connectionUrl,
            authorization: true,
            database: form.database,
          }
        })
        .then((res) => {
          console.log('get response', res);
          this
            .props
            .profiles
            .set(res.id, res.shellId);
          this._close();
          NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
        })
        .catch((err) => {
          console.log('connection failed ', err.message);
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({newConnectionLoading: false});
        });
    } catch (err) {
      NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
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
            <Radio field={form.$('hostRadio')} onChange={this._hostRadioOnChange}/>
            <Input field={form.$('host')} showLabel={false} disable={!form.$('hostRadio').get('value')}/>
            <Input field={form.$('port')} showLabel={false} disable={!form.$('hostRadio').get('value')}/>
          </div>
          <div className="profile-input-row">
            <Radio field={form.$('urlRadio')} onChange={this._hostRadioOnChange}/>
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
            <Input field={form.$('username')} disable={!form.$('sha').get('value')}/>
          </div>
          <div className="profile-input-row">
            <Input field={form.$('password')} disable={!form.$('sha').get('value')}/>
          </div>
          <button className="pt-button" type="submit" onClick={form.onSubmit}>Connect</button>
          <button className="pt-button" type="button" onClick={form.onReset}>Reset</button>
          <button className="pt-button" type="button" onClick={this._close}>Close</button>
        </form>
      </div>
    );
  }


}

