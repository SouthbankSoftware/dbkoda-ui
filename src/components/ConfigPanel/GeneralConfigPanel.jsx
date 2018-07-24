/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-11T14:18:05+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-13T00:03:34+10:00
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

import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { withProps } from 'recompose';
import Icon from '~/styles/icons/color/general-icon.svg';
import { AnchorButton, Dialog, Intent } from '@blueprintjs/core';
import ConfigEntry from './ConfigEntry';
import MenuEntry from './MenuEntry';
import './GeneralConfigPanel.scss';

const paths = {
  dockerized: 'config.mongo.dockerized',
  telemetryEnabled: 'config.telemetryEnabled',
  tableOutputDefault: 'config.tableOutputDefault',
  automaticAutoComplete: 'config.automaticAutoComplete',
  showNewFeaturesDialogOnStart: 'config.showNewFeaturesDialogOnStart',
  maxOutputHistory: 'config.maxOutputHistory',
  mongoCmd: 'config.mongo.cmd',
  passwordStoreEnabled: 'config.passwordStoreEnabled'
};

const MenuIcon = <Icon id="general-icon" />;

export const GeneralMenuEntry = withProps({ icon: MenuIcon, paths })(MenuEntry);

// $FlowIssue
@inject(({ api }) => ({
  api
}))
@observer
export default class GeneralConfigPanel extends React.Component<*, *> {
  state = {
    showRemoveDialog: false
  };

  _closeRemoveDialog = () => {
    this.setState({ showRemoveDialog: false });
  };

  _removePasswordStore = () => {
    const { api } = this.props;

    api.passwordApi.removeStore().then(this._closeRemoveDialog);
  };

  _onChangePasswordStore = (nextValue: boolean) => {
    const { api } = this.props;

    if (nextValue) {
      api.passwordApi.showPasswordDialog(true);
    } else {
      this.setState({ showRemoveDialog: true });
    }
  };

  render() {
    const { api } = this.props;
    const dockerized = api.getCurrentConfigValue(paths.dockerized);
    return (
      <div className="GeneralConfigPanel">
        <div className="MainColumn">
          <ConfigEntry path={paths.mongoCmd} disabled={dockerized} />
          <ConfigEntry path={paths.telemetryEnabled} />
          <ConfigEntry path={paths.tableOutputDefault} />
          <ConfigEntry path={paths.automaticAutoComplete} />
          <ConfigEntry path={paths.showNewFeaturesDialogOnStart} />
          <ConfigEntry path={paths.maxOutputHistory} />
          <ConfigEntry path={paths.passwordStoreEnabled} onChange={this._onChangePasswordStore} />
        </div>
        <div className="SecondaryColumn" />
        <Dialog
          className="confirmDialog"
          title="Remove Password Store?"
          isOpen={this.state.showRemoveDialog}
        >
          <div className="dialogContent">
            <p>{globalString('editor/config/remove_store_dialog/question')}</p>
            <p>{globalString('editor/config/remove_store_dialog/qualifier')}</p>
          </div>
          <div className="dialogButtons">
            <AnchorButton
              className="deleteButton"
              intent={Intent.DANGER}
              onClick={this._removePasswordStore}
            >
              {globalString('editor/config/remove_store_dialog/confirm')}
            </AnchorButton>
            <AnchorButton
              className="cancelButton"
              intent={Intent.PRIMARY}
              onClick={this._closeRemoveDialog}
            >
              {globalString('editor/config/remove_store_dialog/cancel')}
            </AnchorButton>
          </div>
        </Dialog>
      </div>
    );
  }
}
