/*
 * @flow
 *
 * @Author: christrott
 * @Date:   2018-03-15 10:28:46
 * @Last modified by:   christrott
 * @Last modified time: 2018-03-15 10:28:46
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

import React from 'react';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Dialog, AnchorButton, Intent } from '@blueprintjs/core';

type Props = {
  api: *,
  store: *
};

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api
}))
@observer
export default class PasswordResetDialog extends React.Component<Props> {
  @action.bound
  closeResetDialog() {
    this.props.store.password.showResetDialog = false;
  }

  render() {
    return (
      <Dialog
        className="passwordResetDialog"
        isOpen={this.props.store.password.showResetDialog}
        onClose={this.closeResetDialog}
      >
        <div className="dialogContent">
          <p>{globalString('password_dialog/reset_message')}</p>
        </div>
        <div className="dialogButtons">
          <AnchorButton
            className="confirmButton"
            intent={Intent.DANGER}
            text={globalString('general/confirm')}
            onClick={this.closeResetDialog}
          />
        </div>
      </Dialog>
    );
  }
}
