/**
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
import { inject, observer } from 'mobx-react';
import React from 'react';
import { autorun, action } from 'mobx';

import ProfileConfiguration from '../components/ProfileConfigurationComponent';

@inject(({ store, api }) => {
  return {
    store,
    api
  };
})
@observer
class ProfileConfigurationContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { databases: [] };
  }

  componentDidMount() {
    this._autorunDisposer = autorun(() => {
      const { profilingPanel } = this.props.store;
      if (profilingPanel.databases && profilingPanel.databases.length > 0) {
        this.setState({ databases: profilingPanel.databases });
      }
    });
  }

  componentWillUnmount() {
    this._autorunDisposer && this._autorunDisposer();
  }

  @action.bound
  selectDatabase = db => {
    db.selected = !db.selected;
    this.setState({ databases: this.state.databases });
  };

  commitProfileConfiguration = config => {
    console.log('change profile configuration ', config);
    if (config && config.length > 0) {
      this.props.api.setProfilingDatabaseConfiguration(config);
    }
  };

  render() {
    return (
      <ProfileConfiguration
        databases={this.state.databases}
        selectDatabase={this.selectDatabase}
        showPerformancePanel={this.props.showPerformancePanel}
        performancePanel={this.props.store.performancePanel}
        commitProfileConfiguration={this.commitProfileConfiguration}
      />
    );
  }
}

export default ProfileConfigurationContainer;
