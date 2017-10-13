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
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
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
  constructor(props) {
    super(props);
    this.getConfigForm = this.getConfigForm.bind(this);
  }

  @action.bound
  updateValue(name, value) {
    this.props.config.settings[name] = value;
    this.props.config.save();
  }

  getConfigForm() {
    let form;
    switch (this.props.store.configPage.selectedMenu) {
      case 'Application':
        form = <Application updateValue={this.updateValue} />;
        break;
      case 'Paths':
        form = <Paths updateValue={this.updateValue} />;
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
        </div>
      </div>
    );
  }
}
