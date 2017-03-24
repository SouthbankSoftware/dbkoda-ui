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

@observer
export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentWillReceiveProps(nextProps){
  //   console.log('2222 ', this.props.form)
  //   this.props.form.connect = this._connect;
  // }

  // componentWillMount() {
  //   this.props.form.connect = this._connect;
  // }

  @autobind
  _hostRadioOnChange() {
    this.props.form.$('hostRadio').set('value', !this.props.form.$('hostRadio').get('value'));
    this.props.form.$('urlRadio').set('value', !this.props.form.$('hostRadio').get('value'));
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
            <button className="pt-button pt-intent-primary" type="button" onClick={this.props.close}>Close</button>
          </div>
        </form>
      </div>
    );
  }

}
