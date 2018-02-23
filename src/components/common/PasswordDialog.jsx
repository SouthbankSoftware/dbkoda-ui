/*
 * @flow
 *
 * @Author: christrott
 * @Date:   2018-02-06 16:16:38
 * @Last modified by:   christrott
 * @Last modified time: 2018-02-06 16:16:38
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
import { inject, observer } from 'mobx-react';
import { AnchorButton, Dialog, Intent } from '@blueprintjs/core';

type Props = {
  api: *,
  store: *,
  showDialog: boolean,
  verifyPassword: boolean,
};

type State = {
  passPhrase: string,
  passPhraseVerified: boolean,
};

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api
}))
@observer
export default class PasswordDialog extends React.Component<Props, State> {
  MIN_PASSWORD_SIZE = 6;

  constructor(props: Props) {
    super(props);
    this.state = {
      passPhraseVerified: !(this.props.verifyPassword),
      passPhrase: ''
    };
  }

  closeDialog = () => {
    this.props.api.passwordApi.closePasswordDialog();
  }

  onPasswordSubmit = () => {
    if (this.state.passPhraseVerified) {
      this.props.api.passwordApi.sendStoreInit();
      // this.props.api.passwordApi.sendStoreInit(this.state.passPhrase);
      this.setState({ passPhraseVerified: !(this.props.verifyPassword) });
    }
  }

  render() {
    return (
      <Dialog
        className="passwordDialog"
        isOpen={this.props.showDialog}
        onClose={this.props.api.passwordApi.closePasswordDialog}>
        <div className="dialogContent">
          <p>{globalString('password_dialog/message')}</p>
          <input
            type="password"
            className="pt-input passPhraseInput"
            placeholder="Enter Master Password..."
            onChange={event => {
              this.props.store.password.initialPassword = event.target.value;
              // this.setState({ passPhrase: event.target.value });
              this.setState({
                passPhraseVerified: (
                  !this.props.verifyPassword ||
                  this.props.api.passwordApi.verifyPassword()
                )
              });
            }}
          />
          {
            this.props.verifyPassword &&
            <input
              type="password"
              className="pt-input passPhraseInput verifyInput"
              placeholder="Verify Master Password..."
              onChange={event => {
                this.props.store.password.repeatPassword = event.target.value;
                  this.setState({
                    passPhraseVerified: (
                      !this.props.verifyPassword ||
                      this.props.api.passwordApi.verifyPassword()
                    )
                  });
              }}
            />
          }
          {
            this.props.verifyPassword &&
            !this.state.passPhraseVerified &&
            <p className="dialogValidationError">{globalString('password_dialog/validation_message')}</p>
          }
        </div>
        <div className="dialogButtons">
          <AnchorButton
            className="openButton"
            type="submit"
            intent={Intent.SUCCESS}
            text={globalString('general/confirm')}
            onClick={this.onPasswordSubmit}
            disabled={!this.state.passPhraseVerified}
            // loading={}
          />
          <AnchorButton
            className="cancelButton"
            intent={Intent.DANGER}
            text={globalString('general/cancel')}
            onClick={this.props.api.passwordApi.closePasswordDialog}
          />
        </div>
      </Dialog>
    );
  }
}
