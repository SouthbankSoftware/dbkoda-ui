/**
 * connection profile panel class
 */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import autobind from 'autobind-decorator';
import {Intent, Position} from '@blueprintjs/core';
import Radio from './Radio';
import Input from './Input';
import Checkbox from './Checkbox';
import form from './ProfileForm';
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
    form.connect = this._connect;
    form.testConnect = this._testConnect;
  }

  @autobind
  _hostRadioOnChange() {
    form.$('hostRadio').set('value', !form.$('hostRadio').get('value'));
    form.$('urlRadio').set('value', !form.$('hostRadio').get('value'));
  }

  @action.bound
  _close() {
    this.props.layout.drawerOpen = false;
  }

  @action.bound
  _connect(form) {
    if (!this.validConnectionFormData(form)) {
      return;
    }
    this.requestConnection(form);
  }

  /**
   * request connection through feathers client
   *
   * @param form
   */
  requestConnection(form) {
    try {
      featherClient()
        .service('/mongo-connection')
        .create({}, {
          query: form
        })
        .then((res) => {
          console.log('get response', res);
          let message = 'Connection Success!';
          let position = Position.LEFT_TOP;
          if (!form.test) {
            position = Position.RIGHT_TOP;
            this
              .props
              .profiles
              .set(res.id, {shellId: res.shellId, alias: form.alias});
            this._close();
          } else {
            message = 'Test ' + message;
          }
          DBenvyToaster(position).show({
            message,
            intent: Intent.SUCCESS,
            iconName: 'pt-icon-thumbs-up'
          });
        })
        .catch((err) => {
          console.log('connection failed ', err.message);
          DBenvyToaster(Position.LEFT_TOP).show({
            message: err.message,
            intent: Intent.DANGER,
            iconName: 'pt-icon-thumbs-down'
          });
          this.setState({newConnectionLoading: false});
        });
    } catch (err) {
      DBenvyToaster(Position.LEFT_TOP).show({
        message: 'Sorry, not yet implemented!',
        intent: Intent.DANGER,
        iconName: 'pt-icon-thumbs-down'
      });
    }
  }

  /**
   * validate connection form data
   *
   * @param data
   * @returns {boolean}
   */
  validConnectionFormData(data) {
    let validate = true;
    this.props.profiles.forEach((value, key) => {
      if (value.alias === data.alias) {
        DBenvyToaster(Position.LEFT_TOP).show({
          message: 'Alias already existed.',
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down'
        });
        validate = false;
      }
    });
    return validate;
  }

  @action.bound
  _testConnect(data) {
    console.log('validate form ', data);
    if (!this.validConnectionFormData(data)) {
      return;
    }
    this.requestConnection(data);
  }

  render() {
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
            <button className="pt-button pt-intent-primary" type="button" onClick={form.onTest.bind(form)}>Test</button>
            <button className="pt-button pt-intent-primary" type="button" onClick={this._close}>Close</button>
          </div>
        </form>
      </div>
    );
  }

}
