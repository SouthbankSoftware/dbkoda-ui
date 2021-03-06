/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-03-01T13:48:11+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-06-01T14:28:19+10:00
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
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import qs from 'stringquery';

import { PerformancePanel } from '#/PerformancePanel';
import { TopConnectionsPanel } from '#/TopConnectionsPanel';
import { ProfilingPanel } from '#/ProfilingPanel';
import { NewToaster } from '#/common/Toaster';
import { SideNav } from '#/SideNav';
import { NavPanes } from '#/common/Constants';
import { attachToMobx, detachFromMobx } from '~/api/PerformancePanel';
import LoadingView from '#/common/LoadingView';

import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/table/lib/css/table.css';
import '~/styles/global.scss';
import '~/styles/fonts/index.css';
import '#/App.scss';

import { StoragePanel } from '../components/StoragePanel';
import Status from '../components/PerformancePanel/Status';
import './PerformanceWindow.scss';

@inject(allStores => ({ store: allStores.store, api: allStores.store.api }))
@observer
class PerformanceWindow extends React.Component {
  constructor() {
    super();
    this.state = {
      sshStatus: Status.NORMAL,
      mongoStatus: Status.NORMAL
    };

    window.onbeforeunload = this._handleNavigatingAway;
  }

  componentWillMount() {
    const { store } = this.props;
    store.toasterCallback = this._showToasterFromMainWindow;
    store.errorHandler = this._errorHandler;
    document.addEventListener('visibilitychange', this._handleVisibilityChange, false);
    if (window.location.search) {
      const query = qs(window.location.search);
      if (query && query.open) {
        this.props.store.setActiveNavPane(decodeURI(query.open));
      }
    }
  }

  @action.bound
  _handleNavigatingAway(event) {
    l.info(event);
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    this.props.api.sendCommandToMainProcess('pw_windowReload');
    this.props.api.closeShell();
  }

  @action.bound
  _handleVisibilityChange() {
    if (document.hidden) {
      l.notice('becomes hidden');

      const {
        store: { performancePanel }
      } = this.props;

      detachFromMobx(performancePanel);
    } else {
      l.notice('becomes visible');

      const {
        store: { performancePanel }
      } = this.props;

      attachToMobx(performancePanel);
    }
  }

  @action.bound
  _showToasterFromMainWindow(objToaster) {
    if (objToaster.className === 'danger') {
      // this.setState({ isUnresponsive: true });
    }
    NewToaster.show(objToaster);
  }

  @action.bound
  _errorHandler(err, errorMessage) {
    l.info('received an error', err);
    switch (err.code) {
      case 'SSH_NOT_ENABLED':
        this.setState({ sshStatus: Status.NOT_ENABLED });
        break;
      case 'SSH_CONNECTION_CLOSED':
        this.setState({ sshStatus: Status.CONNECTION_BROKEN });
        break;
      case 'MONGO_CONNECTION_CLOSED':
        l.error('mongo connection is closed');
        this.setState({ mongoStatus: Status.CONNECTION_BROKEN });
        NewToaster.show({
          message: globalString('performance/errors/driver_connection_closed'),
          className: 'danger',
          icon: 'thumbs-down'
        });
        break;
      case 'MONGO_RECONNECT_SUCCESS':
        this.setState({ mongoStatus: Status.NORMAL });
        break;
      case 'SSH_RECONNECTION_SUCCESS':
        this.setState({ sshStatus: Status.NORMAL });
        break;
      case 'UNSUPPORTED_STATS_OS':
        this.setState({ sshStatus: Status.UNSUPPORTED_STATS_OS });
        break;
      default:
        NewToaster.show({
          message: errorMessage || err,
          className: 'danger',
          iconName: 'pt-icon-thumbs-down'
        });
        break;
    }
  }

  render() {
    const { store } = this.props;

    return (
      <div className="performanceContainer">
        <SideNav
          className="sideNavPerformance"
          menuItems={[
            NavPanes.PERFORMANCE,
            NavPanes.TOP_CONNECTIONS,
            NavPanes.PROFILING,
            NavPanes.STORAGE_PANEL
          ]}
        />
        <div className="fullPanel">
          {store.drawer &&
            store.drawer.activeNavPane == NavPanes.PERFORMANCE && (
              <div
                style={{
                  height: '100%'
                }}
              >
                {store.performancePanel ? (
                  <PerformancePanel
                    performancePanel={store.performancePanel}
                    onClose={null}
                    resetHighWaterMark={store.api.resetHighWaterMark}
                    resetPerformancePanel={() => {
                      this.setState({ sshStatus: Status.NORMAL, mongoStatus: Status.NORMAL });
                      store.api.resetPerformancePanel();
                    }}
                    sshStatus={this.state.sshStatus}
                    mongoStatus={this.state.mongoStatus}
                  />
                ) : (
                  <LoadingView />
                )}
              </div>
            )}
          {store.drawer &&
            store.drawer.activeNavPane == NavPanes.TOP_CONNECTIONS && <TopConnectionsPanel />}
          {store.drawer && store.drawer.activeNavPane == NavPanes.PROFILING && <ProfilingPanel />}
          {store.drawer &&
            store.drawer.activeNavPane == NavPanes.STORAGE_PANEL &&
            store.api.shellId && (
              <div className="performance-storage">
                <StoragePanel profileId={store.api.profileId} shellId={store.api.shellId} />
              </div>
            )}
        </div>
      </div>
    );
  }
}

export default PerformanceWindow;
