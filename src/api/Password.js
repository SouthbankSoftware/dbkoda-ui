/**
 * @flow
 *
 * @Author: christrott
 * @Date:   2018-02-07T10:41:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   christrott
 * @Last modified time: 2018-02-07T10:43:52+10:00
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
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';

export default class Password {
  store: *;
  api: *;
  config: *;

  constructor(store: *, api: *, config: *) {
    this.store = store;
    this.api = api;
    this.config = config;
    console.log(config);
  }

  @action.bound
  showPasswordDialog(verify: boolean = false) {
    console.log('Show Password Dialog');
    this.store.password.verifyPassword = verify;
    this.store.password.showDialog = true;
  }

  @action.bound
  closePasswordDialog() {
    console.log('Hide Password Dialog');
    this.store.password.showDialog = false;
  }

  @action.bound
  sendStoreInit(masterPassword: string) {
    /*
      NOTE: If UI somehow loses track of the fact there is a password store already,
      when creating on the controller, it will still only allow a store to be created with the same password.
      If the same password is entered, it is still recoverable, if not the same, the UI will receive
      Not Authorised. If the request gets a Not Authorised request, it should note there is in fact an
      existing store, and allow the user to wipe it or enter their previous password.
    */
    const masterHash = this.hashPassword(masterPassword);
    const profileIds = this.store.profileStore.profiles.keys();
    featherClient()
      .service('master-pass')
      .create({ masterPassword: masterHash, profileIds })
      .then(missingProfileIds => {
        console.log(`missingProfileIds: ${missingProfileIds}`);
        // TODO Handle profileIds that haven't yet sent their password
        this.closePasswordDialog();
      })
      .catch(error => {
        console.log(error);
        if (error.code === 401) {
          NewToaster.show({
            message: `${globalString('password_dialog/login_error_message')}`,
            className: 'danger',
            iconName: 'pt-icon-thumbs-down',
          });
        } else {
          NewToaster.show({
            message: `${globalString('password_dialog/general_error_message')}`,
            className: 'danger',
            iconName: 'pt-icon-thumbs-down',
          });
        }
      });
  }

  hashPassword(masterPassword: string): string {
    // TODO Hash masterPassword
    return masterPassword;
  }
}
