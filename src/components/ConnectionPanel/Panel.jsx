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
import {createForm} from './ProfileForm';
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

  form = createForm();

  constructor(props) {
    super(props);
    this.state = {};
    this.form.connect = this._connect;
    this.form.testConnect = this._testConnect;
  }

  @autobind
  _hostRadioOnChange() {
    this
      .form
      .$('hostRadio')
      .set('value', !this.form.$('hostRadio').get('value'));
    this
      .form
      .$('urlRadio')
      .set('value', !this.form.$('hostRadio').get('value'));
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
   * @param data
   */
  @action.bound
  requestConnection(data) {
    try {
      this.props.profileList.creatingNewProfile = true;
      featherClient()
        .service('/mongo-connection')
        .create({}, {query: data})
        .then((res) => {
          console.log('get response', res);
          let message = 'Connection Success!';
          let position = Position.LEFT_BOTTOM;
          if (!data.test) {
            position = Position.RIGHT_TOP;
            this
              .form
              .reset();
            this
              .props
              .profiles
              .set(res.id, {
                id: res.id,
                shellId: res.shellId,
                alias: data.alias
              });
            setTimeout(this.setEditorStatus(res, data), 100);
            this._close();
          } else {
            message = 'Test ' + message;
          }
          DBenvyToaster(position).show({message, intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
        })
        .catch((err) => {
          console.log('connection failed ', err.message);
          DBenvyToaster(Position.LEFT_BOTTOM).show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({newConnectionLoading: false});
        });
    } catch (err) {
      DBenvyToaster(Position.LEFT_BOTTOM).show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
    this.props.profileList.creatingNewProfile = false;
  }

  @action
  setEditorStatus(res, data) {
    this
              .props
              .editors // eslint-disable-line react/prop-types
              .set(res.id, {
                id: res.id,
                alias: data.alias,
                shellId: res.shellId,
                visible: true
              });
    this.props.editorToolbar.noActiveProfile = false;
    this.props.editorToolbar.id = res.id;
    this.props.editorToolbar.shellId = res.shellId;
    this.props.editorToolbar.newConnectionLoading = false;
    this.props.editorPanel.activeEditorId = data.alias + ' (' + res.shellId + ')';
    this.props.editorPanel.activeDropdownId = data.alias;
    this.props.editorToolbar.currentProfile = res.id;
    this.props.editorToolbar.noActiveProfile = false;
  }
  /**
   * validate connection form data
   *
   * @param data
   * @returns {boolean}
   */
  validConnectionFormData(data) {
    let validate = true;
    this
      .props
      .profiles
      .forEach((value, key) => {
        if (value.alias === data.alias) {
          DBenvyToaster(Position.LEFT_TOP).show({message: 'Alias already existed.', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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
    const form = this.form;
    return (
      <div className="pt-dark ">
        <h3 className="profile-title">Create New Connection</h3>
        <form className="profile-form" onSubmit={form.onSubmit}>
          <div>
            <ul>
              <li>
                <Label text="Alias" />
              </li>
              <li>
                <Radio field={form.$('hostRadio')} onChange={this._hostRadioOnChange} />
              </li>
              <li>
                <Radio field={form.$('urlRadio')} onChange={this._hostRadioOnChange} />
              </li>
              <li><Label text="Database" /></li>
            </ul>
            <ul>
              <li>
                <Input field={form.$('alias')} />
              </li>
              <li>
                <div className="host-input-container">
                  <Input
                    field={form.$('host')}
                    showLabel={false}
                    disable={!form
                    .$('hostRadio')
                    .get('value')} />
                  <Label text="Port" />
                  <Input
                    field={form.$('port')}
                    showLabel={false}
                    disable={!form
                    .$('hostRadio')
                    .get('value')} />
                </div>
              </li>
              <li>
                <Input
                  field={form.$('url')}
                  showLabel={false}
                  disable={!form
                  .$('urlRadio')
                  .get('value')} />
              </li>
              <li>
                <div className="host-input-container">
                  <Input field={form.$('database')} />
                  <Checkbox field={form.$('ssl')} />
                </div>
              </li>
            </ul>
          </div>
          <div className="profile-separator" />
          <Label className="profile-align-left" text="Authentication" />
          <Checkbox field={form.$('sha')} />
          <div>
            <ul>
              <li><Label text="User Name" /></li>
              <li><Label text="Password" /></li>
            </ul>
            <ul>
              <li><Input
                field={form.$('username')}
                disable={!form
        .$('sha')
        .get('value')} /></li>
              <li><Input
                field={form.$('password')}
                disable={!form
        .$('sha')
        .get('value')} /></li>
            </ul>
          </div>
          <div className="profile-button-panel">
            <button
              className="pt-button pt-intent-success"
              type="submit"
              onClick={form.onSubmit}>Connect</button>
            <button
              className="pt-button pt-intent-primary"
              type="button"
              onClick={form.onReset}>Reset</button>
            <button
              className="pt-button pt-intent-primary"
              type="button"
              onClick={form
              .onTest
              .bind(form)}>Test</button>
            <button
              className="pt-button pt-intent-primary"
              type="button"
              onClick={this._close}>Close</button>
          </div>
        </form>
      </div>
    );
  }

}
