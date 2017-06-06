/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T10:47:14+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T14:58:38+10:00
 */

/**
 * connection profile panel class
 */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
import {observer} from 'mobx-react';
import autobind from 'autobind-decorator';
import {Button} from '@blueprintjs/core';
import _ from 'lodash';
import Radio from './Radio';
import Input from './Input';
import Checkbox from './Checkbox';
import './style.scss';
import Label from './Label';

@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connecting: false,
      testing: false,
      checkboxHost: true,
      checkboxUrl: false,
      checkboxSSL: false,
      checkboxScram: false
    };
  }

  @autobind _onClickHost() {
    this
      .props
      .form
      .$('hostRadio')
      .set('value', true);
    this
      .props
      .form
      .$('urlRadio')
      .set('value', false);
  }

  @autobind _onClickURL() {
    this
      .props
      .form
      .$('hostRadio')
      .set('value', false);
    this
      .props
      .form
      .$('urlRadio')
      .set('value', true);
  }

  @autobind _onClickUserName() {
    this
      .props
      .form
      .$('sha')
      .set('value', true);
  }

  @autobind _hostRadioOnChange() {
    if (!this.props.form.$('hostRadio').get('value')) {
      this
        .props
        .form
        .$('hostRadio')
        .set('value', !this.props.form.$('hostRadio').get('value'));
      this
        .props
        .form
        .$('urlRadio')
        .set('value', !this.props.form.$('hostRadio').get('value'));
    }
  }

  @autobind _urlRadioOnChange() {
    if (!this.props.form.$('urlRadio').get('value')) {
      this
        .props
        .form
        .$('hostRadio')
        .set('value', !this.props.form.$('hostRadio').get('value'));
      this
        .props
        .form
        .$('urlRadio')
        .set('value', !this.props.form.$('hostRadio').get('value'));
    }
  }

  @autobind _connect(data) {
    this.setState({connecting: true});
    this
      .props
      .connect(data)
      .then(() => this.setState({connecting: false}))
      .catch(() => this.setState({connecting: false}));
  }

  @autobind _test(data) {
    this.setState({testing: true});
    this
      .props
      .connect(data)
      .then(() => this.setState({testing: false}))
      .catch(() => this.setState({testing: false}));
  }

  @autobind _getFormErrors() {
    // invalidate the form with a custom error message
    const errorMsg = [];
    const error = this
      .props
      .form
      .errors();
    _
      .keys(error)
      .forEach((key) => {
        if (error[key]) {
          errorMsg.push(error[key]);
        }
      });
    return errorMsg;
  }

  @autobind _save(data) {
    this
      .props
      .save(data);
  }
  render() {
    const {form, edit, title, profiles} = this.props;
    form.connect = this._connect;
    form.test = this._test;
    form.save = this._save;
    if (!edit && this.props.form.$('alias').value === globalString('connection/form/defaultAlias', '1') && profiles) {
      this
        .props
        .form
        .$('alias')
        .value = globalString('connection/form/defaultAlias', (profiles.size + 1));
    }
    const formErrors = this._getFormErrors();

    return (
      <div className="pt-dark connection-profile">
        <Button
          className="close-button pt-button pt-intent-primary"
          text="X"
          onClick={this.props.close} />
        <h3 className="form-title">{title}</h3>
        <form className="profile-form" onSubmit={form.onSubmit}>
          <Input field={form.$('alias')} showLabel /> {this
            .props
            .form
            .$('hostRadio')
            .get('value')
            ? (
              <div className=" active hostname-form pt-form-group pt-inline zero-margin">
                <Radio field={form.$('hostRadio')} onChange={this._hostRadioOnChange} />
                <Input field={form.$('host')} showLabel divOnClick={this._onClickHost} divOnFocus={this._onClickHost} />
                <Input field={form.$('port')} showLabel divOnClick={this._onClickHost} divOnFocus={this._onClickHost} />
              </div>
            )
            : (
              <div className=" inactive hostname-form pt-form-group pt-inline zero-margin">
                <Radio field={form.$('hostRadio')} onChange={this._hostRadioOnChange} />
                <Input field={form.$('host')} showLabel divOnClick={this._onClickHost} divOnFocus={this._onClickHost} />
                <Input field={form.$('port')} showLabel divOnClick={this._onClickHost} divOnFocus={this._onClickHost} />
              </div>
            )}
          {this
            .props
            .form
            .$('urlRadio')
            .get('value')
            ? (
              <div className=" active url-form pt-form-group pt-inline zero-margin">
                <Radio field={form.$('urlRadio')} onChange={this._urlRadioOnChange} />
                <Input showLabel field={form.$('url')} divOnClick={this._onClickURL} divOnFocus={this._onClickURL} />
              </div>
            )
            : (
              <div className=" inactive url-form pt-form-group pt-inline zero-margin">
                <Radio field={form.$('urlRadio')} onChange={this._urlRadioOnChange} />
                <Input showLabel field={form.$('url')} divOnClick={this._onClickURL} divOnFocus={this._onClickURL} />
              </div>
            )}
          <div className="database-form pt-form-group pt-inline zero-margin">
            <Input field={form.$('database')} showLabel />
          </div>
          <div className="profile-separator" />
          <div className="ssl-form pt-form-group pt-inline zero-margin">
            <Checkbox field={form.$('ssl')} />
          </div>
          <div className="profile-separator" />
          <Label text="Authentication" />
          <Checkbox field={form.$('sha')} /> {this
            .props
            .form
            .$('sha')
            .get('value')
            ? (
              <div className=" active credentials-form">
                <Input field={form.$('username')} divOnClick={this._onClickUserName} divOnFocus={this._onClickUserName} />
                <Input field={form.$('password')} divOnClick={this._onClickUserName} divOnFocus={this._onClickUserName} />
              </div>
            )
            : (
              <div className=" inactive credentials-form">
                <Input field={form.$('username')} divOnClick={this._onClickUserName} divOnFocus={this._onClickUserName} />
                <Input field={form.$('password')} divOnClick={this._onClickUserName} divOnFocus={this._onClickUserName} />
              </div>
            )}
          {(formErrors.length > 0)
            ? (<Button
              className="inactive connectButton pt-button pt-intent-success"
              onClick={form.onSubmit}
              text={globalString('connection/form/connectButton')}
              type="submit"
              disabled={formErrors.length > 0}
              loading={this.state.connecting} />)
            : (<Button
              className="active connectButton pt-button pt-intent-success"
              onClick={form.onSubmit}
              text={globalString('connection/form/connectButton')}
              type="submit"
              disabled={formErrors.length > 0}
              loading={this.state.connecting} />)}
          <div className="profile-button-panel">
            <Button
              className="save-button pt-button pt-intent-primary"
              text={globalString('connection/form/saveButton')}
              onClick={form.onSave} /> {(formErrors.length > 0)
              ? (<Button
                className="inactive test-button pt-button pt-intent-primary"
                onClick={form.onTest}
                text={globalString('connection/form/testButton')}
                disabled={formErrors.length > 0}
                loading={this.state.testing} />)
              : (<Button
                className="active test-button pt-button pt-intent-primary"
                onClick={form.onTest}

                text={globalString('connection/form/testButton')}
                disabled={formErrors.length > 0}
                loading={this.state.testing} />)}
            <Button
              className="reset-button pt-button pt-intent-warning"
              onClick={form.onReset}
              text={globalString('connection/form/resetButton')} />
          </div>
        </form>
        {/* <div className="profile-error-input" style={{ color: Colors.RED2 }}>
          {formErrors.map((error) => {
            return <div key="profile-error"><strong>{error}</strong></div>;
          })}

        </div> */}
      </div>
    );
  }
}
