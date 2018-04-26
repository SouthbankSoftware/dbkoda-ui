/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-26T09:55:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-26T15:42:20+10:00
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
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Tooltip, Intent, Position } from '@blueprintjs/core';
import './styles.scss';
import Button from './Button';
import DatabaseList from './DatabaseList';
import layouts from './Layout';
import Profile from './Profile';
import ProfileTipsComponent from './ProfileTipsComponent';

const ResponsiveGridLayout = WidthProvider(Responsive);
export default class ProfileConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layouts,
      selectedDb: null
    };
  }

  componentDidMount() {
    this.setSelectedDatabase(this.props.databases);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.databases) {
      this.setSelectedDatabase(nextProps.databases);
    }
  }

  setSelectedDatabase(databases) {
    let selectedDb;
    databases.forEach(db => {
      if (db.selected && !selectedDb) {
        selectedDb = db;
      }
    });
    this.setState({ selectedDb });
  }

  getSelectedDatabases = () => {
    const { databases } = this.props;
    if (databases) {
      return databases.filter(db => db.selected);
    }
    return [];
  };

  commitProfileConfiguration = ({ level, slowms, profileSize }) => {
    const dbs = this.getSelectedDatabases();
    const configs = dbs.map(db => {
      return { level, slowms, profileSize, dbName: db.name };
    });
    this.props.commitProfileConfiguration(configs);
  };

  createButtonPanels(layout) {
    const { showProfiling } = this.props;
    return (
      <div key={layout.i} className={layout.className} data-grid={layout}>
        <Button
          className={`${layout.className}-button`}
          text={globalString('performance/profiling/configuration/analyse')}
        />
        {showProfiling && (
          <Tooltip
            className="ResetButton pt-tooltip-indicator pt-tooltip-indicator-form"
            content={globalString('performance/profiling/profilingButtonText')}
            hoverOpenDelay={1000}
            inline
            intent={Intent.PRIMARY}
            position={Position.BOTTOM}
          >
            <Button
              className="top-con-button reset-button pt-button pt-intent-primary"
              text={globalString('performance/profiling/profilingButtonText')}
              onClick={showProfiling}
            />
          </Tooltip>
        )}
      </div>
    );
  }

  selectDatabase = db => {
    this.props.selectDatabase(db);
  };

  createDomElement(layouts) {
    return layouts.map(layout => {
      if (layout.i === 'buttons') {
        return this.createButtonPanels(layout);
      }
      if (layout.i === 'title') {
        return (
          <div key={layout.i} className={layout.className} data-grid={layout}>
            {globalString('performance/profiling/configuration/setup')}
          </div>
        );
      }
      if (layout.i === 'db-list') {
        return (
          <div key={layout.i} className={layout.className} data-grid={layout}>
            <DatabaseList
              databases={this.props.databases}
              selectDatabase={this.selectDatabase}
              performancePanel={this.props.performancePanel}
            />
          </div>
        );
      }
      if (layout.i === 'db-profile') {
        return (
          <div key={layout.i} className={layout.className} data-grid={layout}>
            <Profile
              selectedDb={this.state.selectedDb}
              showProfiling={this.props.showProfiling}
              commitProfileConfiguration={this.commitProfileConfiguration}
            />
          </div>
        );
      }
      if (layout.i === 'profile-tips') {
        return (
          <div key={layout.i} className={layout.className} data-grid={layout}>
            <ProfileTipsComponent />
          </div>
        );
      }
      return <div key={layout.i} className={layout.className} data-grid={layout} />;
    });
  }

  render() {
    console.log(this.props);
    const { layouts } = this.state;
    return (
      <ResponsiveGridLayout
        className="profile-config-panel"
        layouts={{ verticalGridSize: 12 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
      >
        {this.createDomElement(layouts)}
      </ResponsiveGridLayout>
    );
  }
}
