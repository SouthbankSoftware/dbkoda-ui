/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:48:11+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-26T10:09:09+11:00
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

import { action, observable } from 'mobx';
import type { ObservableMap } from 'mobx';
import autobind from 'autobind-decorator';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
// $FlowFixMe
import { NewToaster } from '#/common/Toaster';
import type { WidgetState } from './Widget';

const FOREGROUND_SAMPLING_RATE = 5000;
const BACKGROUND_SAMPLING_RATE = 30000;


export type LayoutState = {
  x: number,
  y: number,
  w: number,
  h: number,
  i: UUID,
  static: boolean,
  background: string,
  gridElementStyle: Object,
  widgetStyle: Object
};

export const performancePanelStatuses = {
  created: 'created',
  background: 'background',
  foreground: 'foreground',
  stopped: 'stopped'
};

export type PerformancePanelStatus = $Keys<typeof performancePanelStatuses>;

export type PerformancePanelState = {
  profileId: UUID,
  widgets: ObservableMap<WidgetState>,
  layouts: ObservableMap<LayoutState>,
  status: PerformancePanelStatus,
  highWaterMarkGroups: number[]
};

export default class PerformancePanelApi {
  store: *;
  api: *;
  config: *;
  powerSaverID: *;
  powerMonitorProfileId: * = null;

  constructor(store: *, api: *, config: *) {
    this.store = store;
    this.api = api;
    this.config = config;

    document.addEventListener('visibilitychange', this._handleAppVisibility, false);
  }

  _createErrorHandler = (profileId: UUID) => {
    return err => {
      console.error(err);

      NewToaster.show({
        message: `Profile ${profileId} error: ${err.message || err}`,
        className: 'danger',
        iconName: 'pt-icon-thumbs-down'
      });
    };
  };

  @action.bound
  _addPerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;

    const performancePanel: PerformancePanelState = {
      profileId,
      widgets: observable.shallowMap(),
      layouts: observable.shallowMap(),
      highWaterMarkGroups: [],
      status: performancePanelStatuses.created
    };

    performancePanels.set(profileId, performancePanel);
  }

  @action.bound
  _removePerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;

    this.stopPerformancePanel(profileId);
    performancePanels.delete(profileId);
  }

  // open connection:
  //  PP doesn't exist: do nothing
  //  PP exist: resume updating with background samplingRate (10s)

  // open performance panel (PP):
  //  PP doesn't exist: create one and start updating with foreground samplingRate
  //  PP exist: updating with foreground samplingRate (5s)

  // close performance panel: updating with background samplingRate

  // close connection: stop updating. PP state is preserved

  // destroy connection:
  //  PP doesn't exist: do nothing
  //  PP exist: stop updating and destroy PP state

  @action.bound
  hasPerformancePanel(profileId: UUID): boolean {
    const { performancePanels } = this.store;

    return performancePanels.has(profileId);
  }

  @action.bound
  startPerformancePanel(profileId: UUID, foreground: boolean = true) {
    const performancePanel = this.store.performancePanels.get(profileId);

    if (
      performancePanel &&
      performancePanel.status !== performancePanelStatuses.created
    ) {
      const { widgets } = performancePanel;
      const itemsSet = new Set();

      for (const widget of widgets.values()) {
        for (const item of widget.items) {
          itemsSet.add(item);
        }
      }

      const statsSrv = featherClient();
      // statsSrv.statsService.timeout = 30000;
      statsSrv.statsService
        .create({
          profileId,
          items: [...itemsSet],
          samplingRate: foreground
            ? FOREGROUND_SAMPLING_RATE
            : BACKGROUND_SAMPLING_RATE,
          debug: true
        })
        .then(
          action(() => {
            for (const widget of widgets.values()) {
              widget.state = 'loaded';
            }

            performancePanel.status = foreground
              ? performancePanelStatuses.foreground
              : performancePanelStatuses.background;
          })
        )
        .catch(this._createErrorHandler(profileId));
    }
    if (foreground) {
      if (this.config.settings.keepDisplayAwake) {
        this._startDisplaySleepBlocker();
      } else {
        this._startPowerMonitor(profileId);
      }
    }
  }

  @action.bound
  stopPerformancePanel(profileId: UUID) {
    const performancePanel = this.store.performancePanels.get(profileId);

    if (
      performancePanel &&
      performancePanel.status !== performancePanelStatuses.created
    ) {
      featherClient()
        .statsService.remove(profileId)
        .catch(this._createErrorHandler(profileId));
      performancePanel.status = performancePanelStatuses.stopped;
    }
  }

  @action.bound
  openPerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;
    let performancePanel = performancePanels.get(profileId);

    if (!performancePanel) {
      this._addPerformancePanel(profileId);
      performancePanel = performancePanels.get(profileId);
    } else {
      this.startPerformancePanel(profileId, true);
    }

    this.store.performancePanel = performancePanel;
  }

  @action.bound
  closePerformancePanel(profileId: UUID, destroy: boolean = false, suspend: boolean = false) {
    if (destroy) {
      const { performancePanels } = this.store;

      if (performancePanels.has(profileId)) {
        this._removePerformancePanel(profileId);
      }
    } else {
      this.startPerformancePanel(profileId, false);
    }
    this.store.performancePanel = null;

    if (!suspend) {
      if (this.config.settings.keepDisplayAwake) {
        this._stopDisplaySleepBlocker();
      } else {
        this._stopPowerMonitor();
      }
    }
  }

  _startDisplaySleepBlocker() {
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      const { powerSaveBlocker } = electron.remote;
      if (!this.powerSaverID) {
        this.powerSaverID = powerSaveBlocker.start('prevent-display-sleep');
        console.log('Power Saver Status:', powerSaveBlocker.isStarted(this.powerSaverID), ', id:', this.powerSaverID);
      }
    }
  }
  _stopDisplaySleepBlocker() {
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      const { powerSaveBlocker } = electron.remote;
      if (this.powerSaverID) {
        powerSaveBlocker.stop(this.powerSaverID);
        console.log('Power Saver Status:', powerSaveBlocker.isStarted(this.powerSaverID), ', id:', this.powerSaverID);
        this.powerSaverID = null;
      }
    }
  }
  _startPowerMonitor(profileId) {
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      const { powerMonitor } = electron.remote;
      if (this.powerMonitorProfileId === null) {
        this.powerMonitorProfileId = profileId;
        powerMonitor.on('suspend', this._suspendPerformancePanel);
        powerMonitor.on('resume', this._resumePerformancePanel);
      }
    }
  }
  _stopPowerMonitor() {
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      const { powerMonitor } = electron.remote;
      if (this.powerMonitorProfileId !== null) {
        this.powerMonitorProfileId = null;
        powerMonitor.removeListener('suspend', this._suspendPerformancePanel);
        powerMonitor.removeListener('resume', this._resumePerformancePanel);
      }
    }
  }
  @autobind
  _handleAppVisibility() {
    if (document.hidden) {
      console.log('App is Hidden!!!');
      this._suspendPerformancePanel();
    } else {
      console.log('App is Visible!!!');
      this._resumePerformancePanel();
    }
  }
  @autobind
  _suspendPerformancePanel() {
    console.log('The system is going to sleep!!!');
    if (this.powerMonitorProfileId !== null) {
      this.closePerformancePanel(this.powerMonitorProfileId, false, true);
    }
  }
  @autobind
  _resumePerformancePanel() {
    console.log('The system is going to resume!!!');
    if (this.powerMonitorProfileId !== null) {
      this.openPerformancePanel(this.powerMonitorProfileId);
    }
  }
}
