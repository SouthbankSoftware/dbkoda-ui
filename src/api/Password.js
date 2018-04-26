/**
 * @flow
 *
 * @Author: christrott
 * @Date:   2018-02-07T10:41:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-22T18:00:37+11:00
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

import { action } from 'mobx';
import _ from 'lodash';
import Mousetrap from 'mousetrap';
import { featherClient } from '~/helpers/feathers';
import { DialogHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import { NewToaster } from '#/common/Toaster';
import { Broker, EventType } from '../helpers/broker';

export default class Password {
  store: *;
  api: *;
  config: *;
  MIN_PASSWORD_LENGTH: number = 8;

  constructor(store: *, api: *, config: *) {
    this.store = store;
    this.api = api;
    this.config = config;
    Broker.on(EventType.MASTER_PASSWORD_REQUIRED, this.showPasswordDialog.bind(this));
    Broker.on(EventType.PASSWORD_STORE_RESET, this.onPasswordReset.bind(this));
  }

  @action.bound
  onPasswordReset() {
    console.log('Due to too many login attempts, your password store has been reset!');
    this.closePasswordDialog();
    this.store.password.showResetDialog = true;
    this.config.patch({
      passwordStoreEnabled: false
    });
  }

  @action.bound
  showPasswordDialog(verify: boolean = false) {
    console.log('Show Password Dialog');
    this._setupKeyBind();
    this.store.password.verifyPassword = verify === true;
    this.store.password.showDialog = true;
  }

  @action.bound
  closePasswordDialog() {
    console.log('Hide Password Dialog');
    this._removeKeyBind();
    this.store.password.showDialog = false;
    this.store.password.initialPassword = '';
    this.store.password.repeatPassword = '';
  }

  _setupKeyBind() {
    // $FlowFixMe
    Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this.closePasswordDialog);
    // $FlowFixMe
    Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, this.sendStoreInit);
  }

  _removeKeyBind() {
    // $FlowFixMe
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys);
    // $FlowFixMe
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys);
  }

  verifyPassword() {
    const { initialPassword, repeatPassword } = this.store.password;
    return initialPassword === repeatPassword && initialPassword.length >= this.MIN_PASSWORD_LENGTH;
  }

  @action.bound
  sendStoreInit() {
    /*
      TODO: If UI somehow loses track of the fact there is a password store already,
      when creating on the controller, it will still only allow a store to be created with the same password.
      If the same password is entered, it is still recoverable, if not the same, the UI will receive
      Not Authorised. If the request gets a Not Authorised request, it should note there is in fact an
      existing store, and allow the user to wipe it or enter their previous password.
    */
    const { initialPassword } = this.store.password;
    const masterHash = this.hashPassword(initialPassword);
    const profileSshIds = _.filter([...this.store.profileStore.profiles.entries()], value => {
      return value[1].ssh || value[1].keyRadio;
    }).map(value => {
      return `${value[1].id}-s`;
    });
    const profileIds = _.concat([...this.store.profileStore.profiles.keys()], profileSshIds);
    return featherClient()
      .service('master-pass')
      .create({ masterPassword: masterHash, profileIds })
      .then(missingProfileIds => {
        console.log(`missingProfileIds: ${missingProfileIds}`);
        this.store.password.missingProfiles = missingProfileIds;
        if (!this.config.settings.passwordStoreEnabled) {
          this.config.patch({
            passwordStoreEnabled: true
          });
        }
        this.closePasswordDialog();
      })
      .catch(error => {
        console.log(error);
        if (error.code === 401) {
          NewToaster.show({
            message: `${globalString('password_dialog/login_error_message')}`,
            className: 'danger',
            icon: 'thumbs-down'
          });
        } else {
          NewToaster.show({
            message: `${globalString('password_dialog/general_error_message')}`,
            className: 'danger',
            icon: 'thumbs-down'
          });
        }
      });
  }

  removeStore() {
    return featherClient()
      .service('master-pass')
      .remove()
      .then(() => {
        this.config.patch({
          passwordStoreEnabled: false
        });
      })
      .catch(error => {
        NewToaster.show({
          message: `Could not remove password store: ${error.message}`,
          className: 'danger',
          icon: 'thumbs-down'
        });
      });
  }

  hashPassword(masterPassword: string): string {
    // TODO Hash masterPassword

    return masterPassword;
  }

  removeMissingStoreId(profileId: string) {
    _.remove(this.store.password.missingProfiles, id => {
      return id === profileId;
    });
  }

  isProfileMissingFromStore(profileId: string) {
    return (
      _.findIndex(this.store.password.missingProfiles, id => {
        return id === profileId;
      }) > -1
    );
  }
}
