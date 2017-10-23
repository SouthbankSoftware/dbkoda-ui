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
 * @Last modified time: 2017-10-23T15:44:29+11:00
 */

import React from 'react';
import { action, toJS, reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { AnchorButton, Intent } from '@blueprintjs/core';
import ConfigDatabaseIcon from '~/styles/icons/config-database-icon-1.svg';
import ErrorView from '#/common/ErrorView';
import LoadingView from '#/common/LoadingView';
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
  reactionToConfig;

  constructor(props) {
    super(props);
    this.state = {
      changedFields: [],
      newSettings: toJS(this.props.config.settings)
    };
    this.getConfigForm = this.getConfigForm.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.renderFieldLabel = this.renderFieldLabel.bind(this);
    this.reactionToConfig = reaction(
      () => this.props.config.settings,
      () => {
        this.setState({ newSettings: toJS(this.props.config.settings) });
      });
  }

  updateValue(name, value) {
    const updatedSettings = { ...this.state.newSettings };
    updatedSettings[name] = value;
    this.setState({ newSettings: updatedSettings });
    const changedIndex = this.state.changedFields.indexOf(name);
    if (changedIndex === -1) {
      this.setState({
        changedFields: [...this.state.changedFields, name]
      });
    } else if (value === this.props.config.settings[name]) {
      const newFields = this.state.changedFields.slice();
      newFields.splice(changedIndex, 1);
      this.setState({ changedFields: newFields });
    }
  }

  @action.bound
  saveConfig() {
    this.props.config.settings = this.state.newSettings;
    this.props.config.save();
    this.setState({ changedFields: [] });
  }

  renderFieldLabel(fieldName) {
    return (<label htmlFor="fieldName">
      { globalString(`editor/config/${fieldName}`) }
      { (this.state.changedFields.indexOf(fieldName) !== -1) &&
        <div id={`unsavedFileIndicator_${fieldName}`}
          className="unsavedFileIndicator" /> }
    </label>);
  }

  getConfigForm() {
    let form;
    switch (this.props.store.configPage.selectedMenu) {
      case 'Application':
        form = (<Application updateValue={this.updateValue}
          settings={this.state.newSettings}
          changedFields={this.state.changedFields}
          renderFieldLabel={this.renderFieldLabel} />);
        break;
      case 'Paths':
        form = (<Paths updateValue={this.updateValue}
          settings={this.state.newSettings}
          changedFields={this.state.changedFields}
          renderFieldLabel={this.renderFieldLabel} />);
        break;
      default:
        form = <ErrorView error="Unknown menu item selection." />;
        break;
    }
    return form;
  }

  render() {
    return (
      <div className="configPanelTabWrapper">
        <div className="configPanelWrapper">
          <div className="configTitleWrapper">
            <h1><ConfigDatabaseIcon className="dbKodaSVG" width={25} height={25} /> {this.props.title}</h1>
            { false && <LoadingView /> }
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
