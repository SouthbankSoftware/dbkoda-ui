/**
 * Connection profile panel class
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T10:47:14+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-21T16:31:06+11:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable react/jsx-no-bind */

import React from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { Button } from '@blueprintjs/core';
import _ from 'lodash';
import Radio from './Radio';
import Input from './Input';
import FileInput from './FileInput';
import Checkbox from './Checkbox';
import './style.scss';
import Label from './Label';

const MAX_URL_ALIAS_LENGTH = 25;
const MAX_HOSTNAME_ALIAS_LENGTH = 20;

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
      checkboxScram: false,
      hasAliasChanged: false,
    };
  }

  @autobind
  _onClickHost() {
    this.props.form.$('hostRadio').set('value', true);
    this.props.form.$('urlRadio').set('value', false);
  }

  @autobind
  _onClickURL() {
    this.props.form.$('hostRadio').set('value', false);
    this.props.form.$('urlRadio').set('value', true);
  }

  @autobind
  _onClickUserName() {
    this.props.form.$('sha').set('value', true);
  }

  @autobind
  _onClickAuthDB() {
    this.props.form.$('sha').set('value', true);
  }

  @autobind
  _hostRadioOnChange() {
    if (!this.props.form.$('hostRadio').get('value')) {
      this.props.form
        .$('hostRadio')
        .set('value', !this.props.form.$('hostRadio').get('value'));
      this.props.form
        .$('urlRadio')
        .set('value', !this.props.form.$('hostRadio').get('value'));
    }
  }

  @autobind
  _urlRadioOnChange() {
    if (!this.props.form.$('urlRadio').get('value')) {
      this.props.form
        .$('hostRadio')
        .set('value', !this.props.form.$('hostRadio').get('value'));
      this.props.form
        .$('urlRadio')
        .set('value', !this.props.form.$('hostRadio').get('value'));
    }
  }

  @autobind
  _passRadioOnChange() {
    if (!this.props.form.$('passRadio').get('value')) {
      this.props.form
        .$('passRadio')
        .set('value', !this.props.form.$('passRadio').get('value'));
      this.props.form
        .$('keyRadio')
        .set('value', !this.props.form.$('passRadio').get('value'));
    }
  }

  @autobind
  _keyRadioOnChange() {
    if (!this.props.form.$('keyRadio').get('value')) {
      this.props.form
        .$('passRadio')
        .set('value', !this.props.form.$('passRadio').get('value'));
      this.props.form
        .$('keyRadio')
        .set('value', !this.props.form.$('passRadio').get('value'));
    }
  }

  @autobind
  _onClickRemotePass() {
    this.props.form.$('passRadio').set('value', true);
    this.props.form.$('keyRadio').set('value', false);
  }

  @autobind
  _onClickKey() {
    this.props.form.$('passRadio').set('value', false);
    this.props.form.$('keyRadio').set('value', true);
  }

  @autobind
  _connect(data) {
    this.setState({ connecting: true });
    this.props
      .connect(data)
      .then(() => this.setState({ connecting: false }))
      .catch(() => this.setState({ connecting: false }));
  }

  @autobind
  _test(data) {
    this.setState({ testing: true });
    this.props
      .connect(data)
      .then(() => this.setState({ testing: false }))
      .catch(() => this.setState({ testing: false }));
  }

  @autobind
  _getFormErrors() {
    // invalidate the form with a custom error message
    const errorMsg = [];
    const error = this.props.form.errors();
    _.keys(error).forEach((key) => {
      if (error[key]) {
        errorMsg.push(error[key]);
      }
    });
    return errorMsg;
  }

  @autobind
  _updateAliasState() {
    this.state.hasAliasChanged = true;
  }

  @autobind
  _save(data) {
    this.props.save(data);
  }
  render() {
    const { form, edit, title, profiles } = this.props;
    form.connect = this._connect;
    form.test = this._test;
    form.save = this._save;
    if (
      !edit &&
      form.$('hostRadio').get('value') &&
      profiles &&
      !this.state.hasAliasChanged
    ) {
      if (
        form.$('host').get('value').length > MAX_HOSTNAME_ALIAS_LENGTH &&
        form.$('username').get('value').length > 0
      ) {
        form.$('alias').value =
          form.$('username').get('value') +
          '@' +
          form.$('host').value.substring(0, MAX_HOSTNAME_ALIAS_LENGTH) +
          ':' +
          form.$('port').value +
          ' - ' +
          (profiles.size + 1);
      } else if (
        form.$('host').get('value').length > MAX_HOSTNAME_ALIAS_LENGTH
      ) {
        form.$('alias').value =
          form.$('host').value.substring(0, MAX_HOSTNAME_ALIAS_LENGTH) +
          ':' +
          form.$('port').value +
          ' - ' +
          (profiles.size + 1);
      } else if (form.$('username').get('value').length > 0) {
        form.$('alias').value =
          form.$('username').get('value') +
          '@' +
          form.$('host').value +
          ':' +
          form.$('port').value +
          ' - ' +
          (profiles.size + 1);
      } else {
        form.$('alias').value =
          form.$('host').value +
          ':' +
          form.$('port').value +
          ' - ' +
          (profiles.size + 1);
      }
    } else if (
      !edit &&
      form.$('urlRadio').get('value') &&
      profiles &&
      !this.state.hasAliasChanged
    ) {
      if (form.$('url').get('value').length > MAX_URL_ALIAS_LENGTH) {
        if (form.$('url').value.split('//').length > 1) {
          form.$('alias').value = form
            .$('url')
            .value.split('//')[1]
            .substring(0, MAX_URL_ALIAS_LENGTH);
        } else {
          form.$('alias').value = form
            .$('url')
            .value.substring(0, MAX_URL_ALIAS_LENGTH);
        }
      } else if (form.$('url').value.split('//').length > 1) {
        if (form.$('url').value.split('//')[1] === '') {
          form.$('alias').value = 'New Profile - ' + (profiles.size + 1);
        } else {
          form.$('alias').value = form.$('url').value.split('//')[1];
        }
      } else {
        form.$('alias').value = form.$('url').value;
      }
    }

    const formErrors = this._getFormErrors();

    return (
      <div className="pt-dark connection-profile">
        <Button
          className="close-button pt-button pt-intent-primary"
          text="X"
          onClick={this.props.close}
        />
        <h3 className="form-title">{title}</h3>
        <form className="profile-form" onSubmit={form.onSubmit}>
          <Input
            field={form.$('alias')}
            divOnChange={this._updateAliasState}
            showLabel
            autoFocus
          />{' '}
          <div
            className={
              (form.$('hostRadio').get('value') ? ' active' : ' inactive') +
              ' hostname-form pt-form-group pt-inline zero-margin'
            }
          >
            <Radio
              field={form.$('hostRadio')}
              onChange={this._hostRadioOnChange}
            />
            <Input
              field={form.$('host')}
              showLabel
              divOnClick={this._onClickHost}
              divOnFocus={this._onClickHost}
            />
            <Input
              field={form.$('port')}
              showLabel
              divOnClick={this._onClickHost}
              divOnFocus={this._onClickHost}
            />
          </div>
          <div
            className={
              (form.$('urlRadio').get('value') ? ' active' : ' inactive') +
              ' url-form pt-form-group pt-inline zero-margin'
            }
          >
            <Radio
              field={form.$('urlRadio')}
              onChange={this._urlRadioOnChange}
            />
            <Input
              showLabel
              field={form.$('url')}
              divOnClick={this._onClickURL}
              divOnFocus={this._onClickURL}
            />
          </div>
          <div className="database-form pt-form-group pt-inline zero-margin">
            <Input field={form.$('database')} showLabel />
          </div>
          <div className="profile-separator" />
          <div className="ssh-form pt-form-group pt-inline zero-margin">
            <Checkbox field={form.$('ssh')} />{' '}
          </div>
          {form.$('ssh').get('value') && (
            <div>
              <div className="remoteHost-form pt-form-group pt-inline zero-margin">
                <Input field={form.$('remoteHost')} showLabel />
              </div>
              <div className="remoteuser-form pt-form-group pt-inline zero-margin">
                <Input field={form.$('remoteUser')} showLabel />
              </div>
              <div
                className={
                  (form.$('passRadio').get('value') ? ' active' : ' inactive') +
                  ' remotepass-form pt-form-group pt-inline zero-margin'
                }
              >
                <Radio
                  field={form.$('passRadio')}
                  onChange={this._passRadioOnChange}
                />
                <Input
                  field={form.$('remotePass')}
                  divOnClick={this._onClickRemotePass}
                  divOnFocus={this._onClickRemotePass}
                />
              </div>
              <div
                className={
                  (form.$('keyRadio').get('value') ? ' active' : ' inactive') +
                  ' remotePass-form pt-form-group pt-inline zero-margin'
                }
              >
                <Radio
                  field={form.$('keyRadio')}
                  onChange={this._keyRadioOnChange}
                />

                <FileInput
                  field={form.$('sshKeyFile')}
                  divOnClick={this._onClickKey}
                  divOnFocus={this._onClickKey}
                />

                <Input
                  field={form.$('passPhrase')}
                  divOnClick={this._onClickKey}
                  divOnFocus={this._onClickKey}
                />
              </div>
              <div className="ssh-form pt-form-group pt-inline zero-margin">
                <Checkbox field={form.$('sshTunnel')} />{' '}
              </div>
            </div>
          )}
          <div className="profile-separator" />
          <div className="ssl-form pt-form-group pt-inline zero-margin">
            <Checkbox field={form.$('ssl')} />
          </div>
          <div
            className={
              (form.$('ssl').get('value') ? ' active' : ' inactive') +
              ' sslAllowInvalidCertificates-form pt-form-group pt-inline zero-margin'
            }
          >
            <Checkbox field={form.$('sslAllowInvalidCertificates')} />
          </div>
          <div className="profile-separator" />
          <Label text="Authentication" />
          <Checkbox field={form.$('sha')} />{' '}
          <div
            className={
              (form.$('sha').get('value') ? ' active' : ' inactive') +
              ' credentials-form'
            }
          >
            <Input
              field={form.$('username')}
              divOnClick={this._onClickUserName}
              divOnFocus={this._onClickUserName}
            />
            <Input
              field={form.$('password')}
              divOnClick={this._onClickUserName}
              divOnFocus={this._onClickUserName}
            />
          </div>
          <div
            className={
              (form.$('sha').get('value') ? ' active' : ' inactive') +
              ' authentication-database-form pt-form-group pt-inline zero-margin'
            }
          >
            <Input
              field={form.$('authenticationDatabase')}
              showLabel
              divOnClick={this._onClickUserName}
              divOnFocus={this._onClickUserName}
            />
          </div>
          <Button
            className={
              (formErrors.length > 0 ? 'inactive' : 'active') +
              ' connectButton pt-button pt-intent-success'
            }
            onClick={form.onSuccess}
            text={globalString('connection/form/connectButton')}
            type="submit"
            disabled={formErrors.length > 0}
            loading={this.state.connecting}
          />
          <div className="profile-button-panel">
            <Button
              className="save-button pt-button pt-intent-primary"
              text={globalString('connection/form/saveButton')}
              onClick={form.onSave}
            />{' '}
            <Button
              className={
                (formErrors.length > 0 ? 'inactive' : 'active') +
                ' test-button pt-button pt-intent-primary'
              }
              onClick={form.onTest}
              text={globalString('connection/form/testButton')}
              disabled={formErrors.length > 0}
              loading={this.state.testing}
            />
            <Button
              className="reset-button pt-button pt-intent-warning"
              onClick={form.onReset}
              text={globalString('connection/form/resetButton')}
            />
          </div>
        </form>
      </div>
    );
  }
}
