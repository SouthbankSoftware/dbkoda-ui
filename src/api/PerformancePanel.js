/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:48:11+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-28T13:31:51+11:00
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
import { action, observable } from 'mobx';
import type { ObservableMap } from 'mobx';
import autobind from 'autobind-decorator';
import { Broker, EventType } from '~/helpers/broker';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
// $FlowFixMe
import { NewToaster } from '#/common/Toaster';
import schema from '#/PerformancePanel/schema.json';
import type { WidgetState } from './Widget';

const FOREGROUND_SAMPLING_RATE = 5000;
const BACKGROUND_SAMPLING_RATE = 30000;
const MAX_HISTORY_SIZE = 720; // 1h with 5s sampling rate

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
  stats: { [string]: any },
  rowHeight: number,
  cols: number,
  rows: number,
  midWidth: number,
  leftWidth: number
};

/**
 * Expected behaviours
 *
 * open connection:
 *  PP doesn't exist: do nothing
 *  PP exist: resume updating with background samplingRate (10s)
 *
 * open performance panel (PP):
 *  PP doesn't exist: create one and start updating with foreground samplingRate
 *  PP exist: updating with foreground samplingRate (5s)
 *
 * close performance panel: update with background samplingRate
 *
 * close connection: stop updating. PP state is preserved
 *
 * destroy connection:
 *  PP doesn't exist: do nothing
 *  PP exist: stop updating and destroy PP state
 *
 * become invisible:
 *  PP doesn't exist: do nothing
 *  PP exist: unmount PP and update with background samplingRate
 *
 * become visible:
 *  PP doesn't exist: do nothing
 *  PP exist: mount PP and update with foreground samplingRate
 *
 * refresh: set UI to stop state without destroying Stats service
 */
export default class PerformancePanelApi {
  store: *;
  api: *;
  config: *;
  powerSaverID: *;
  powerMonitorProfileId: * = null;
  _disposers: Map<UUID, *> = new Map();

  constructor(store: *, api: *, config: *) {
    this.store = store;
    this.api = api;
    this.config = config;

    Broker.once(EventType.WINDOW_REFRESHING, () => {
      for (const pId of this.store.performancePanels.keys()) {
        this.stopPerformancePanel(pId, false);
      }
    });
    // document.addEventListener('visibilitychange', this._handleAppVisibility, false);
  }

  _handleError = (profileId: UUID, err: Error | string, level: 'error' | 'warn' = 'error') => {
    console.error(err);

    NewToaster.show({
      // $FlowFixMe
      message: `Profile ${profileId} error: ${err.message || err}`,
      className: level === 'error' ? 'danger' : 'warning',
      iconName: 'pt-icon-thumbs-down'
    });
  };

  _updateLayoutStyle = (layout, leftWidth, midWidth) => {
    const lSep = leftWidth;
    const rSep = leftWidth + midWidth;

    if (layout.background === 'light') {
      layout.widgetStyle.backgroundColor = '#2D2D2D';
      layout.widgetStyle.opacity = '0.8';
      layout.widgetStyle.padding = '10px';

      if (layout.x === lSep) {
        layout.gridElementStyle.paddingLeft = '20px';
      }

      if (layout.x + layout.w === rSep) {
        layout.gridElementStyle.paddingRight = '20px';
      }
    }

    if (layout.padding) {
      layout.widgetStyle.padding = layout.padding;
    }

    return layout;
  };

  @action.bound
  _addPerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;
    const layouts = observable.shallowMap();

    const performancePanel: PerformancePanelState = observable.shallowObject({
      profileId,
      widgets: observable.shallowMap(),
      layouts,
      status: performancePanelStatuses.stopped,
      stats: {},
      rowHeight: schema.rowHeight,
      cols: schema.cols,
      rows: schema.rows,
      midWidth: schema.midWidth,
      leftWidth: schema.leftWidth
    });

    performancePanels.set(profileId, performancePanel);

    for (const w of schema.widgets) {
      const id = this.api.addWidget(profileId, w.items, w.type, w.extraState);

      const layout = observable.shallowObject(
        this._updateLayoutStyle({
          i: id,
          widgetStyle: {},
          gridElementStyle: {},
          ...w.layout
        })
      );

      layouts.set(id, layout);
    }
  }

  @action.bound
  _removePerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;

    this.stopPerformancePanel(profileId);
    performancePanels.delete(profileId);
  }

  @action.bound
  hasPerformancePanel(profileId: UUID): boolean {
    const { performancePanels } = this.store;

    return performancePanels.has(profileId);
  }

  @action.bound
  startPerformancePanel(profileId: UUID, foreground: boolean = true) {
    const performancePanel = this.store.performancePanels.get(profileId);

    if (performancePanel && performancePanel.status === performancePanelStatuses.stopped) {
      performancePanel.status = foreground
        ? performancePanelStatuses.foreground
        : performancePanelStatuses.background;

      const { widgets } = performancePanel;
      const itemsSet = new Set();

      for (const widget of widgets.values()) {
        for (const item of widget.items) {
          itemsSet.add(item);
        }
      }

      // handle errors
      const handleStatsServiceError = payload => {
        const { error, level } = payload;

        this._handleError(profileId, error, level);
      };

      Broker.on(EventType.STATS_ERROR(profileId), handleStatsServiceError);

      // handle new data
      const handleNewData = action(payload => {
        const { timestamp, value: rawValue, stats } = payload;

        performancePanel.stats = stats;

        for (const widget of widgets.values()) {
          const { items, values, showAlarms } = widget;

          if (values.length >= MAX_HISTORY_SIZE) {
            values.splice(0, MAX_HISTORY_SIZE - values.length + 1);
          }

          const value = {
            timestamp,
            value: _.pick(rawValue, items),
            stats: _.pick(stats, items)
          };

          if (showAlarms) {
            const alarmObj = _.get(rawValue, `alarm.${showAlarms}`);

            if (alarmObj) {
              // $FlowFixMe
              value.alarms = _.orderBy(
                _.map(alarmObj, v => {
                  const alarm = _.pick(v, ['level', 'message']);
                  alarm.timestamp = timestamp;
                  return alarm;
                }),
                ['timestamp'],
                ['desc']
              );
            }
          }

          values.push(value);
        }
      });

      Broker.on(EventType.STATS_DATA(profileId), handleNewData);

      // set up a disposer to cleanup everything related when called
      this._disposers.set(profileId, () => {
        Broker.off(EventType.STATS_ERROR(profileId), handleStatsServiceError);
        Broker.off(EventType.STATS_DATA(profileId), handleNewData);
      });

      // always call create because it is idempotent
      const statsSrv = featherClient();
      statsSrv.statsService
        .create({
          profileId,
          items: [...itemsSet],
          samplingRate: foreground ? FOREGROUND_SAMPLING_RATE : BACKGROUND_SAMPLING_RATE,
          debug: true
        })
        .then(
          action(() => {
            for (const widget of widgets.values()) {
              widget.state = 'loaded';
            }
          })
        )
        .catch(
          action(err => {
            performancePanel.status = performancePanelStatuses.stopped;

            this._handleError(profileId, err);
          })
        );
    }

    // if (foreground) {
    //   if (this.config.settings.performancePanel_preventDisplaySleep) {
    //     this._startDisplaySleepBlocker();
    //   } else {
    //     this._startPowerMonitor(profileId);
    //   }
    // }
  }

  @action.bound
  stopPerformancePanel(profileId: UUID, destroyService: boolean = true) {
    const performancePanel = this.store.performancePanels.get(profileId);

    if (performancePanel && performancePanel.status !== performancePanelStatuses.stopped) {
      const prevStatus = performancePanel.status;
      performancePanel.status = performancePanelStatuses.stopped;

      const disposer = this._disposers.get(profileId);

      if (disposer) {
        disposer();
        this._disposers.delete(profileId);
      }

      if (destroyService) {
        featherClient()
          .statsService.remove(profileId)
          .catch(
            action(err => {
              performancePanel.status = prevStatus;

              this._handleError(profileId, err);
            })
          );
      }
    }
  }

  @action.bound
  openPerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;
    let performancePanel = performancePanels.get(profileId);

    if (!performancePanel) {
      this._addPerformancePanel(profileId);
      performancePanel = performancePanels.get(profileId);
    }

    this.startPerformancePanel(profileId, true);

    this.store.performancePanel = performancePanel;
  }

  @action.bound
  closePerformancePanel(profileId: UUID, destroy: boolean = false, _suspend: boolean = false) {
    if (destroy) {
      const { performancePanels } = this.store;

      if (performancePanels.has(profileId)) {
        this.stopPerformancePanel(profileId);
        this._removePerformancePanel(profileId);
      }
    } else {
      this.startPerformancePanel(profileId, false);
    }

    this.store.performancePanel = null;

    // if (!suspend) {
    //   if (this.config.settings.performancePanel_preventDisplaySleep) {
    //     this._stopDisplaySleepBlocker();
    //   } else {
    //     this._stopPowerMonitor();
    //   }
    // }
  }

  _startDisplaySleepBlocker() {
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      const { powerSaveBlocker } = electron.remote;
      if (!this.powerSaverID) {
        this.powerSaverID = powerSaveBlocker.start('prevent-display-sleep');
        console.log(
          'Power Saver Status:',
          powerSaveBlocker.isStarted(this.powerSaverID),
          ', id:',
          this.powerSaverID
        );
      }
    }
  }
  _stopDisplaySleepBlocker() {
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      const { powerSaveBlocker } = electron.remote;
      if (this.powerSaverID) {
        powerSaveBlocker.stop(this.powerSaverID);
        console.log(
          'Power Saver Status:',
          powerSaveBlocker.isStarted(this.powerSaverID),
          ', id:',
          this.powerSaverID
        );
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
