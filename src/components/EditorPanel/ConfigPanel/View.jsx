/**
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-15T09:57:04+11:00
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
import React from 'react';
import { action, reaction, toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { AnchorButton, Intent } from '@blueprintjs/core';
import ConfigDatabaseIcon from '~/styles/icons/config-database-icon-1.svg';
import DBKodaIcon from '~/styles/icons/dbkoda-logo.svg';
import ErrorView from '#/common/ErrorView';
import Menu from './Menu';
import Application from './Application';
import PasswordStore from './PasswordStore';
import Paths from './Paths';
import Performance from './Performance';
import './Panel.scss';

@inject(allStores => ({
  store: allStores.store,
  config: allStores.config
}))
@observer
export default class View extends React.Component {
  _disposer: *;

  componentDidMount() {
    this._disposer = reaction(
      () => toJS(this.props.config.settings),
      settingsObj => {
        this.props.store.resetConfigPage(settingsObj);
      },
      {
        fireImmediately: true
      }
    );
  }

  componentWillUnmount() {
    this._disposer && this._disposer();
  }

  @action.bound
  updateValue(configPath, nextValue) {
    const { settings } = this.props.config;
    const { changedFields, newSettings } = this.props.store.configPage;

    _.set(newSettings, configPath, nextValue);
    // update changedFields
    const oldValue = _.get(settings, configPath);

    if (nextValue === oldValue) {
      // unchanged, remove from changedFields
      _.remove(changedFields, v => v === configPath);
    } else if (!_.includes(changedFields, configPath)) {
      // changed, add to changedFields
      changedFields.push(configPath);
    }
  }

  applyChanges = () => {
    const { newSettings } = this.props.store.configPage;
    const { patch } = this.props.config;

    patch(newSettings);
  };

  renderFieldLabel = fieldName => {
    const strPath = fieldName.replace('.', '/');

    return (
      <label htmlFor="fieldName">
        {globalString(`editor/config/${strPath}`)}
        {this.props.store.configPage.changedFields.indexOf(fieldName) !==
          -1 && (
          <div
            id={`unsavedFileIndicator_${fieldName}`}
            className="unsavedFileIndicator"
          />
        )}
      </label>
    );
  };

  getConfigForm = () => {
    let form;
    switch (this.props.store.configPage.selectedMenu) {
      case 'Application':
        form = (
          <Application
            updateValue={this.updateValue}
            settings={this.props.store.configPage.newSettings}
            changedFields={this.props.store.configPage.changedFields}
            renderFieldLabel={this.renderFieldLabel}
          />
        );
        break;
      case 'Paths':
        form = (
          <Paths
            updateValue={this.updateValue}
            settings={this.props.store.configPage.newSettings}
            changedFields={this.props.store.configPage.changedFields}
            renderFieldLabel={this.renderFieldLabel}
          />
        );
        break;
      case 'PasswordStore':
        form = (
          <PasswordStore
            updateValue={this.updateValue}
            settings={this.props.store.configPage.newSettings}
            changedFields={this.props.store.configPage.changedFields}
            renderFieldLabel={this.renderFieldLabel}
          />
        );
        break;
      case 'Performance':
        form = (
          <Performance
            updateValue={this.updateValue}
            settings={this.props.store.configPage.newSettings}
            changedFields={this.props.store.configPage.changedFields}
            renderFieldLabel={this.renderFieldLabel}
          />
        );
        break;
      default:
        form = <ErrorView error="Unknown menu item selection." />;
        break;
    }
    return form;
  };

  shouldShowApplyButton = () => {
    return (
      this.props.store.configPage.selectedMenu === 'Performance' ||
      this.props.store.configPage.selectedMenu === 'PasswordStore' ||
      this.props.store.configPage.selectedMenu === 'Paths' ||
      this.props.store.configPage.selectedMenu === 'Application'
    );
  };

  render() {
    return (
      <div className="configPanelTabWrapper">
        <div className="configPanelWrapper">
          <div className="configTitleWrapper">
            <h1>
              <DBKodaIcon className="dbKodaSVG logo" width={25} height={25} />{' '}
              {globalString('editor/home/welcome')}
            </h1>
          </div>
          <div className="configContentWrapper">
            <div className="configLeftMenuWrapper" width={25}>
              <Menu selectedMenu={this.props.store.configPage.selectedMenu} />
            </div>
            <div className="configRightFormWrapper" width={75}>
              {this.getConfigForm()}
            </div>
          </div>
          <div className="configContentFooter">
            {this.shouldShowApplyButton() && (
              <AnchorButton
                className="saveBtn"
                intent={Intent.SUCCESS}
                onClick={this.applyChanges}
                text={globalString('editor/config/applyButton')}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
