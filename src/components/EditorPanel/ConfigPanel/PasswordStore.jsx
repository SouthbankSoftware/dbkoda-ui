/**
 * @Author: christrott
 * @Date:   2017-02-06T11:51:13+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-14T14:09:25+11:00
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

import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  AnchorButton,
  Checkbox,
  Dialog,
  Intent,
  Switch
} from '@blueprintjs/core';

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api
}))
@observer
export default class PasswordStore extends React.Component {
  constructor(props) {
    super(props);
    this.onCheckboxToggle = this.onCheckboxToggle.bind(this);
    this.closeRemoveDialog = this.closeRemoveDialog.bind(this);
    this.removePasswordStore = this.removePasswordStore.bind(this);
    this.state = { isConfirmOpen: false };
  }

  onCheckboxToggle(e) {
    const fieldValue = e.target.checked;
    if (fieldValue === true) {
      this.props.api.passwordApi.showPasswordDialog(true);
    } else {
      this.setState({ isConfirmOpen: true });
    }
  }

  closeRemoveDialog(success: boolean = true) {
    this.setState({ isConfirmOpen: false });
    this.props.updateValue('passwordStoreEnabled', success);
  }

  removePasswordStore() {
    this.props.api.passwordApi.removeStore().then(() => {
      this.props.updateValue('passwordStoreEnabled', false);
      this.closeRemoveDialog(false);
    });
  }

  render() {
    return (
      <div className="formContentWrapper">
        <div className="sectionHeader">
          {' '}
          {globalString('editor/config/sections/passwords')}
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('passwordStoreEnabled')}
          <Dialog
            className="confirmDialog"
            title="Remove Password Store?"
            isOpen={this.state.isConfirmOpen}
          >
            <div className="dialogContent">
              <p>
                {globalString('editor/config/remove_store_dialog/question')}
              </p>
              <p>
                {globalString('editor/config/remove_store_dialog/qualifier')}
              </p>
            </div>
            <div className="dialogButtons">
              <AnchorButton
                className="deleteButton"
                intent={Intent.DANGER}
                onClick={this.removePasswordStore}
              >
                {globalString('editor/config/remove_store_dialog/confirm')}
              </AnchorButton>
              <AnchorButton
                className="cancelButton"
                intent={Intent.PRIMARY}
                onClick={this.closeRemoveDialog}
              >
                {globalString('editor/config/remove_store_dialog/cancel')}
              </AnchorButton>
            </div>
          </Dialog>
        </div>
        <div className="switch">
          <Switch
            type="text"
            id="passwordStoreEnabled"
            checked={this.props.settings.passwordStoreEnabled}
            onChange={this.onCheckboxToggle}
          />
          <div className="switchLabel">
            {this.props.settings.passwordStoreEnabled &&
              globalString('general/on')}
            {!this.props.settings.passwordStoreEnabled &&
              globalString('general/off')}
          </div>
        </div>
      </div>
    );
  }
}
