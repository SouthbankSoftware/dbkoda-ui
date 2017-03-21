/**
 * connection profile panel class
 */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import validatorjs from 'validatorjs';
import autobind from 'autobind-decorator';
import {Intent, Position} from '@blueprintjs/core';
import forms from './Form';
import Radio from './Radio';
import Input from './Input';
import Checkbox from './Checkbox';
import ProfileForm from './ProfileForm';
import './style.scss';
import {featherClient} from '~/helpers/feathers';
import {DBenvyToaster, NewToaster} from '../common/Toaster';
import Label from './Label';

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
        console.log('xxx');
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
      const split = connectionUrl.split('mongodb://');
      connectionUrl = 'mongodb://' + form.username + ':' + form.password + '@' + split[1];
    }
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
            .set(res.id, {shellId: res.shellId, alias: form.alias});
          this._close();
          NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
        })
        .catch((err) => {
          console.log('connection failed ', err.message);
          DBenvyToaster(Position.LEFT_TOP).show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({newConnectionLoading: false});
        });
    } catch (err) {
      DBenvyToaster(Position.LEFT_TOP).show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  render() {
    const form = this.form;
    return (
      <div className="pt-dark ">
        <h3 className="profile-title">Create New Connection</h3>
        <form className="profile-form" onSubmit={form.onSubmit}>
          <div>
            <ul>
              <li>
                <Label text='Alias'/>
              </li>
              <li>
                <Radio field={form.$('hostRadio')} onChange={this._hostRadioOnChange}/>
              </li>
              <li>
                <Radio field={form.$('urlRadio')} onChange={this._hostRadioOnChange}/>
              </li>
              <li><Label text="Database"/></li>
            </ul>
            <ul>
              <li>
                <Input field={form.$('alias')}/>
              </li>
              <li>
                <div className="host-input-container">
                  <Input field={form.$('host')} showLabel={false} disable={!form.$('hostRadio').get('value')}/>
                  <Label text='Port'/>
                  <Input field={form.$('port')} showLabel={false} disable={!form.$('hostRadio').get('value')}/>
                </div>
              </li>
              <li>
                <Input field={form.$('url')} showLabel={false} disable={!form.$('urlRadio').get('value')}/>
              </li>
              <li>
                <div className="host-input-container">
                  <Input field={form.$('database')}/>
                  <Checkbox field={form.$('ssl')}/>
                </div>
              </li>
            </ul>
          </div>
          <div className="profile-separator"/>
          <Label className="profile-align-left" text='Authentication'/>
          <Checkbox field={form.$('sha')}/>
          <div>
            <ul>
              <li><Label text='User Name'/></li>
              <li><Label text='Password'/></li>
            </ul>
            <ul>
              <li><Input field={form.$('username')} disable={!form.$('sha').get('value')}/></li>
              <li><Input field={form.$('password')} disable={!form.$('sha').get('value')}/></li>
            </ul>
          </div>
          <div className="profile-button-panel">
            <button className="pt-button pt-intent-success" type="submit" onClick={form.onSubmit}>Connect</button>
            <button className="pt-button pt-intent-primary" type="button" onClick={form.onReset}>Reset</button>
            <button className="pt-button pt-intent-primary" type="button" onClick={this._close}>Close</button>
          </div>
        </form>
      </div>
    );
  }


}
