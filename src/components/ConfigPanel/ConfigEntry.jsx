/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-03T15:08:13+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-12T21:36:53+10:00
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

import _ from 'lodash';
import * as React from 'react';
import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Switch, Button, Popover, PopoverInteractionKind, Icon } from '@blueprintjs/core';
import classNames from 'classnames';
import { withStateHandlers } from 'recompose';
import './ConfigEntry.scss';

const ChangeIndicator = withStateHandlers(
  { hovered: false },
  {
    onMouseEnter: () => () => ({ hovered: true }),
    onMouseLeave: () => () => ({ hovered: false })
  }
)(({ hovered, onMouseEnter, onMouseLeave, onClick }) => (
  <Icon
    className="ChangeIndicator"
    icon={hovered ? 'cross' : 'dot'}
    iconSize={18}
    title="Click to cancel current change"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
  />
));

type Store = {
  configStore: *,
  configPanel: *
};

type Props = {
  store: any | Store,
  api: any | *,
  path: string,
  disabled: boolean
};

// $FlowIssue
@inject(({ store: { configPanel }, configStore, api }) => ({
  store: {
    configPanel,
    configStore
  },
  api
}))
@observer
export default class ConfigEntry extends React.Component<Props> {
  static defaultProps = {
    store: null,
    api: null,
    disabled: false
  };

  static getConfigSchemaPath = (path: string): string =>
    path.replace('config', 'configSchema').replace(/\./g, '.properties.');

  static getConfigDefaultPath = (path: string): string => path.replace('config', 'configDefaults');

  @computed
  get configSchemaPath() {
    return ConfigEntry.getConfigSchemaPath(this.props.path);
  }

  @computed
  get configSchema() {
    const { configStore } = this.props.store;

    return _.get(configStore, this.configSchemaPath);
  }

  @computed
  get configDefaultPath() {
    return ConfigEntry.getConfigDefaultPath(this.props.path);
  }

  @computed
  get configDefault() {
    const { configStore } = this.props.store;

    return _.get(configStore, this.configDefaultPath);
  }

  _onCancelChange = () => {
    const {
      api,
      path,
      store: { configStore }
    } = this.props;

    api.setCurrentConfigValue(path, _.get(configStore, path));
  };

  _onSwitchChange = (event: *) => {
    const { api, path } = this.props;

    api.setCurrentConfigValue(path, event.target.checked);
  };

  _onInputChange = (event: *) => {
    const { api, path } = this.props;

    api.setCurrentConfigValue(path, event.target.value || this.configDefault);
  };

  _onBrowse = () => {
    if (IS_ELECTRON) {
      const { api, path } = this.props;
      const { dialog, BrowserWindow } = window.require('electron').remote;
      const { fileOnly, dirOnly } = this.configSchema;
      let properties;

      if (fileOnly) {
        properties = ['openFile'];
      } else if (dirOnly) {
        properties = ['openDirectory'];
      } else {
        properties = ['openFile', 'openDirectory'];
      }

      dialog.showOpenDialog(
        BrowserWindow.getFocusedWindow(),
        {
          defaultPath: api.getCurrentConfigValue(path),
          properties
        },
        paths => {
          if (!paths || paths.length === 0) {
            return;
          }

          api.setCurrentConfigValue(path, _.last(paths));
        }
      );
    }
  };

  render() {
    const {
      store: {
        configPanel: { changes }
      },
      api,
      path,
      disabled
    } = this.props;
    const { configSchema, configDefault } = this;
    // $FlowFixMe
    const { description, title = path, type, browsable } = configSchema;
    let currentConfigValue = api.getCurrentConfigValue(path);

    if (currentConfigValue == null) {
      currentConfigValue = '';
    }

    const configError = api.getConfigError(path);
    const hasError = Boolean(configError);

    let valueControl;

    if (type === 'boolean') {
      valueControl = (
        <Switch
          className={classNames('Switch', { error: hasError })}
          large
          disabled={disabled}
          checked={currentConfigValue}
          onChange={this._onSwitchChange}
        />
      );
    } else {
      valueControl = (
        <input
          className={classNames('TextInput', { error: hasError })}
          type="text"
          placeholder={configDefault}
          disabled={disabled}
          value={currentConfigValue}
          onChange={this._onInputChange}
        />
      );
    }

    return (
      <div className="ConfigEntry">
        <div className="Header">
          {title}
          {description && (
            <Popover
              className="Tooltip"
              popoverClassName="ConfigEntryTooltip"
              content={<div className="Body">{description}</div>}
              interactionKind={PopoverInteractionKind.HOVER}
              minimal
            >
              <Icon className="InfoIcon" icon="help" iconSize={12} title={false} />
            </Popover>
          )}
        </div>
        <div className="Body">
          {valueControl}
          {browsable && (
            <Button
              className="BrowseBtn"
              text="Browse"
              minimal
              disabled={disabled}
              onClick={this._onBrowse}
            />
          )}
          {changes.has(path) && <ChangeIndicator onClick={this._onCancelChange} />}
        </div>
        <div className="Footer">{configError}</div>
      </div>
    );
  }
}
