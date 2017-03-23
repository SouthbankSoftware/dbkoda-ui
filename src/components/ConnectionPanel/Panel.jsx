/**
 * connection profile panel class
 */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, observable} from 'mobx';
import autobind from 'autobind-decorator';
import {Intent, Position} from '@blueprintjs/core';
import Radio from './Radio';
import Input from './Input';
import Checkbox from './Checkbox';
import './style.scss';
import {featherClient} from '~/helpers/feathers';
import {DBenvyToaster} from '../common/Toaster';
import Label from './Label';

@inject(allStores => ({
  layout: allStores.store.layout,
  profiles: allStores.store.profiles,
  editors: allStores.store.editors,
  editorPanel: allStores.store.editorPanel,
  editorToolbar: allStores.store.editorToolbar,
  profileList: allStores.store.profileList
}))
@observer
export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};

  }

  componentWillMount(){
    this.props.form.connect = this._connect;
    this.props.form.testConnect = this._testConnect;
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
    if (!this.validateConnectionFormData(form)) {
      return;
    }
    this.props.profileList.creatingNewProfile = true;
    this.props.connect(form)
      .then(v=>{
        this._close();
      })
      .catch((err) => {
        this.props.profileList.creatingNewProfile = false;
        this.handleConnectionError(err);
      });;
  }

  /**
   * validate connection form data
   *
   * @param data
   * @returns {boolean}
   */
  validateConnectionFormData(data) {
    let validate = true;
    this.props.profiles.forEach((value, key) => {
      if (value.alias === data.alias) {
        DBenvyToaster(Position.LEFT_BOTTOM).show({
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
    if (!this.validateConnectionFormData(data)) {
      return;
    }
    this.props.connect(data)
      .catch((err) => {
        this.handleConnectionError(err);
      });;
  }

  handleConnectionError(err) {
    console.log('connection failed ', err);
    this.props.profileList.creatingNewProfile = false;
    DBenvyToaster(Position.LEFT_BOTTOM).show({
      message: err.message,
      intent: Intent.DANGER,
      iconName: 'pt-icon-thumbs-down'
    });
  }

  render() {
    const form = this.props.form;
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
