/*
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
 *
 *
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-09-27T10:40:53+10:00
 */

import React from 'react';
import { action, toJS, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { AnchorButton, Intent } from '@blueprintjs/core';
import ConfigDatabaseIcon from '~/styles/icons/config-database-icon-1.svg';
import ErrorView from '#/common/ErrorView';
import Menu from './Menu';
import Application from './Application';
import Paths from './Paths';
import './Panel.scss';

@inject(allStores => ({
  store: allStores.store,
  config: allStores.config
}))
@observer
export default class View extends React.Component {
  newSettings;
  changedFields;

  constructor(props) {
    super(props);
    // Create a clone of the config so we can track changes from the original
    this.newSettings = observable(toJS(this.props.config.settings));
    this.changedFields = [];
    this.getConfigForm = this.getConfigForm.bind(this);
  }

  @action.bound
  updateValue(name, value) {
    this.newSettings[name] = value;
    const changedIndex = this.changedFields.indexOf(name);
    if (changedIndex === -1) {
      this.changedFields.push(name);
    } else if (this.newSettings[name] === this.props.config.settings[name]) {
      this.changedFields.splice(changedIndex, 1);
    }
  }

  @action.bound
  saveConfig() {
    this.props.config.settings = this.newSettings;
    this.props.config.save();
  }

  getConfigForm() {
    let form;
    switch (this.props.store.configPage.selectedMenu) {
      case 'Application':
        form = (<Application updateValue={this.updateValue}
          settings={this.newSettings}
          changedFields={this.changedFields} />);
        break;
      case 'Paths':
        form = (<Paths updateValue={this.updateValue}
          settings={this.newSettings}
          changedFields={this.changedFields} />);
        break;
      default:
        form = <ErrorView error="Unknown menu item selection." />;
        break;
    }
    return form;
  }

  render() {
    /* if(!this.props.config.configInit) {
      return (<div className="configPanelTabWrapper">
        <div className="configPanelWrapper">
          <div className="configTitleWrapper">
            <h1><ConfigDatabaseIcon className="dbKodaSVG" width={25} height={25} /> {this.props.title}</h1>
          </div>
          <div className="configContentWrapper">
            <LoadingView />
          </div>
        </div>
      </div>);
    } */
    return (
      <div className="configPanelTabWrapper">
        <div className="configPanelWrapper">
          <div className="configTitleWrapper">
            <h1><ConfigDatabaseIcon className="dbKodaSVG" width={25} height={25} /> {this.props.title}</h1>
          </div>
          <div className="configContentWrapper">
            <div className="configLeftMenuWrapper" width={25}>
              <Menu selectedMenu={this.props.store.configPage.selectedMenu} />
            </div>
            <div className="configRightFormWrapper" width={75}>
              { this.getConfigForm() }
            </div>
          </div>
          <div className="configContentFooter">
            <AnchorButton className="saveBtn"
              intent={Intent.SUCCESS}
              onClick={this.saveConfig}
              text="Save" />
          </div>
        </div>
      </div>
    );
  }
}
