/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:48:11+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-06T11:47:04+11:00
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
import { Broker, EventType } from '~/helpers/broker';
import { dump } from 'dumpenvy';
import { serializer } from '#/common/mobxDumpenvyExtension';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
// $FlowFixMe
import { NewToaster } from '#/common/Toaster';
import schema from '#/PerformancePanel/schema.json';
import type { WidgetState } from './Widget';

const FOREGROUND_SAMPLING_RATE = 5000;
const BACKGROUND_SAMPLING_RATE = 5000;
const MAX_HISTORY_SIZE = 720; // 1h with 5s sampling rate
const ALARM_DISPLAYING_WINDOW = 60000; // ms, 1 min

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
  background: 'background', // PP is in background, unmounted
  foreground: 'foreground', // PP is in foreground, mounted in main window
  external: 'external', // PP is in foreground, mounted in an external window
  stopped: 'stopped' // PP is stopped, unmounted
};

const RUNNABLE_STATUSES = [
  performancePanelStatuses.background,
  performancePanelStatuses.foreground,
  performancePanelStatuses.external
];

export type PerformancePanelStatus = $Keys<typeof performancePanelStatuses>;
export type PerformancePanelStateBuffer = {
  stats: { [string]: any }
};
export type PerformancePanelState = {
  profileId: UUID,
  profileAlias: string,
  widgets: ObservableMap<WidgetState>,
  layouts: ObservableMap<LayoutState>,
  status: PerformancePanelStatus,
  stats: { [string]: any },
  rowHeight: number,
  cols: number,
  rows: number,
  midWidth: number,
  leftWidth: number,
  buffer: ?PerformancePanelStateBuffer
};

/**
 * Integrates new data with current mobx store or buffer. Whenever, window goes to background, new
 * data is buffered to stop all reactions
 */
export const handleNewData = (payload: *, performancePanel: PerformancePanelState) => {
  const { timestamp, value: rawValue, stats } = payload;
  const { widgets, buffer } = performancePanel;

  (buffer || performancePanel).stats = stats;

  for (const widget of widgets.values()) {
    const { items, showAlarms, buffer } = widget;
    const { values, alarms } = buffer || widget;

    if (values.length >= MAX_HISTORY_SIZE) {
      values.splice(0, MAX_HISTORY_SIZE - values.length + 1);
    }

    const value = _.pick(rawValue, items);

    if (!_.isEmpty(value)) {
      values.push({
        timestamp,
        value
      });
    }

    if (showAlarms && alarms) {
      const alarmObj = _.get(rawValue, `alarm.${showAlarms}`);

      if (alarmObj) {
        alarms.unshift(
          ..._.map(alarmObj, v => {
            const alarm = _.pick(v, ['level', 'message']);
            alarm.timestamp = timestamp;
            return alarm;
          })
        );
      }

      // remove old alarms
      let removeCount = 0;
      // $FlowFixMe
      _.forEachRight(alarms, v => {
        const { timestamp } = v;

        if (Date.now() - timestamp > ALARM_DISPLAYING_WINDOW) {
          removeCount += 1;
        } else {
          return false;
        }
      });

      removeCount && alarms.splice(-removeCount, removeCount);
    }
  }
};

export const detachFromMobx = (performancePanel: PerformancePanelState) => {
  const { stats } = performancePanel;

  performancePanel.buffer = {
    stats
  };

  const { widgets } = performancePanel;

  for (const widget of widgets.values()) {
    const { values, alarms } = widget;

    widget.buffer = {
      values: values.slice(),
      ...(alarms ? { alarms: alarms.slice() } : null)
    };
  }
};

export const attachToMobx = (performancePanel: PerformancePanelState) => {
  const { buffer } = performancePanel;

  if (buffer) {
    const { stats } = buffer;

    performancePanel.stats = stats;
    performancePanel.buffer = null;
  }

  const { widgets } = performancePanel;

  for (const widget of widgets.values()) {
    const { buffer, alarms } = widget;

    if (buffer) {
      const { values, alarms: bufferedAlarms } = buffer;

      widget.values.replace(values);
      alarms && bufferedAlarms && alarms.replace(bufferedAlarms);
      widget.buffer = null;
    }
  }
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
  _disposers: Map<UUID, *> = new Map();
  _powerBlockerDisposers: Map<UUID, *> = new Map();

  externalPerformanceWindows: Map<UUID, *> = new Map();

  constructor(store: *, api: *, config: *) {
    this.store = store;
    this.api = api;
    this.config = config;

    this._attachPerformancePanelsToMobx();

    document.addEventListener('visibilitychange', this._handleVisibilityChange);

    let powerMonitorDisposer;

    if (IS_ELECTRON) {
      const { remote: { powerMonitor }, ipcRenderer } = window.require('electron');

      const handleSuspend = () => {
        logToMain('info', 'os is suspending');
      };

      const handleResume = () => {
        logToMain('info', 'os is resuming');
      };

      powerMonitor.on('suspend', handleSuspend);
      powerMonitor.on('resume', handleResume);

      powerMonitorDisposer = () => {
        powerMonitor.removeListener('suspend', handleSuspend);
        powerMonitor.removeListener('resume', handleResume);
      };

      ipcRenderer.on('performance', this._handlePerformanceWindowEvents);
    }

    // stop all PP when refreshing
    Broker.once(EventType.WINDOW_REFRESHING, () => {
      document.removeEventListener('visibilitychange', this._handleVisibilityChange);

      powerMonitorDisposer && powerMonitorDisposer();

      for (const pId of this.store.performancePanels.keys()) {
        this.transformPerformancePanel(pId, performancePanelStatuses.stopped);
      }
    });
  }

  @action.bound
  _attachPerformancePanelsToMobx() {
    for (const pP of this.store.performancePanels.values()) {
      const { status } = pP;

      if (status === performancePanelStatuses.foreground) {
        attachToMobx(pP);
      }
    }
  }

  @action.bound
  _handleVisibilityChange() {
    if (document.hidden) {
      logToMain('info', 'becomes hidden');

      for (const pP of this.store.performancePanels.values()) {
        const { status } = pP;

        if (status === performancePanelStatuses.foreground) {
          detachFromMobx(pP);
        }
      }
    } else {
      logToMain('info', 'becomes visible');

      this._attachPerformancePanelsToMobx();
    }
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
    const { performancePanels, profileStore: { profiles } } = this.store;
    const profile = profiles.get(profileId);
    const layouts = observable.shallowMap();

    const performancePanel: PerformancePanelState = observable.shallowObject({
      profileId,
      profileAlias: _.get(profile, 'alias', ''),
      widgets: observable.shallowMap(),
      layouts,
      status: performancePanelStatuses.stopped,
      stats: {},
      rowHeight: schema.rowHeight,
      cols: schema.cols,
      rows: schema.rows,
      midWidth: schema.midWidth,
      leftWidth: schema.leftWidth,
      buffer: null
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

    performancePanels.delete(profileId);
  }

  _addPowerBlocker = profileId => {
    if (IS_ELECTRON && this.config.settings.performancePanel_preventDisplaySleep) {
      const { remote: { powerSaveBlocker } } = window.require('electron');

      const powerBlockerId = powerSaveBlocker.start('prevent-display-sleep');
      logToMain('info', `started power blocker for Performance Panel ${profileId}`);

      this._powerBlockerDisposers.set(profileId, () => {
        powerSaveBlocker.stop(powerBlockerId);
        logToMain('info', `stopped power blocker for Performance Panel ${profileId}`);
      });
    }
  };

  _removePowerBlocker = profileId => {
    const powerBlockerDisposer = this._powerBlockerDisposers.get(profileId);

    if (powerBlockerDisposer) {
      powerBlockerDisposer();
      this._powerBlockerDisposers.delete(profileId);
    }
  };

  @action.bound
  _runPerformancePanel(profileId: UUID, to: 'background' | 'foreground' | 'external') {
    const performancePanel = this.store.performancePanels.get(profileId);

    if (!performancePanel) return;

    const { status } = performancePanel;

    if (!_.includes(RUNNABLE_STATUSES, to)) {
      console.error(
        `PerformancePanel API: invalid (not runnable) to \`${to}\` for _runPerformancePanel`
      );
      return;
    }

    const { widgets, stats } = performancePanel;
    const itemsSet = new Set();

    for (const widget of widgets.values()) {
      for (const item of widget.items) {
        itemsSet.add(item);
      }
    }

    if (status === performancePanelStatuses.stopped) {
      // prevent app suspension
      let suspensionBlockerDisposer;

      if (IS_ELECTRON) {
        const { remote: { powerSaveBlocker } } = window.require('electron');
        const suspensionBlockerId = powerSaveBlocker.start('prevent-app-suspension');

        logToMain('info', `started suspension blocker for Performance Panel ${profileId}`);

        suspensionBlockerDisposer = () => {
          powerSaveBlocker.stop(suspensionBlockerId);
          logToMain('info', `stopped suspension blocker for Performance Panel ${profileId}`);
        };
      }

      // handle errors
      const handleStatsServiceError = payload => {
        const { error, level } = payload;

        this._handleError(profileId, error, level);
      };

      Broker.on(EventType.STATS_ERROR(profileId), handleStatsServiceError);

      // handle new data
      const _handleNewData = action(payload => {
        logToMain('debug', `new data for Performance Panel ${profileId}`);

        handleNewData(payload, performancePanel);

        if (performancePanel.status === performancePanelStatuses.external) {
          const externalWindow = this.externalPerformanceWindows.get(profileId);
          if (externalWindow && externalWindow.status === 'ready') {
            this._sendMsgToPerformanceWindow({
              command: 'mw_updateData',
              profileId,
              dataObject: payload
            });
          }
        }
      });

      Broker.on(EventType.STATS_DATA(profileId), _handleNewData);

      // set up a disposer to cleanup everything related when called
      this._disposers.set(profileId, () => {
        suspensionBlockerDisposer && suspensionBlockerDisposer();
        Broker.off(EventType.STATS_ERROR(profileId), handleStatsServiceError);
        Broker.off(EventType.STATS_DATA(profileId), _handleNewData);
        this._removePowerBlocker(profileId);
      });
    }

    // always call create because it is idempotent
    const statsSrv = featherClient();
    statsSrv.statsService
      .create({
        profileId,
        items: [...itemsSet],
        samplingRate:
          to === performancePanelStatuses.background
            ? BACKGROUND_SAMPLING_RATE
            : FOREGROUND_SAMPLING_RATE,
        debug: true,
        ...(performancePanel.status === performancePanelStatuses.stopped ? { stats } : null)
      })
      .then(
        action(() => {
          for (const widget of widgets.values()) {
            widget.state = 'loaded';
          }
        })
      )
      .catch(err => {
        this._handleError(profileId, err);
      });

    performancePanel.status = to;
  }

  @action.bound
  _stopPerformancePanel(profileId: UUID) {
    const performancePanel = this.store.performancePanels.get(profileId);

    if (performancePanel && performancePanel.status !== performancePanelStatuses.stopped) {
      performancePanel.status = performancePanelStatuses.stopped;

      const disposer = this._disposers.get(profileId);

      if (disposer) {
        disposer();
        this._disposers.delete(profileId);
      }

      featherClient()
        .statsService.remove(profileId)
        .catch(err => {
          this._handleError(profileId, err);
        });
    }
  }

  @action.bound
  _mountPerformancePanelToMainWindow(profileId: UUID) {
    const performancePanel = this.store.performancePanels.get(profileId);

    this.store.performancePanel = performancePanel;
  }

  @action.bound
  _unmountPerformancePanelFromMainWindow() {
    this.store.performancePanel = null;
  }

  @action.bound
  _mountPerformancePanelToExternalWindow(profileId: UUID) {
    this._sendMsgToPerformanceWindow({ command: 'mw_createWindow', profileId });
    this.externalPerformanceWindows.set(profileId, { status: 'started' });
  }

  @action.bound
  _unmountPerformancePanelFromExternalWindow(profileId: UUID) {
    this._sendMsgToPerformanceWindow({ command: 'mw_closeWindow', profileId });
    this.externalPerformanceWindows.set(profileId, { status: 'closed' });
  }

  @action.bound
  _handlePerformanceWindowEvents(event, args) {
    console.log('_handlePerformanceWindowEvents::', args);
    const { performancePanels } = this.store;
    if (args.profileId) {
      if (args.command === 'pw_windowReady') {
        const performancePanel = performancePanels.get(args.profileId);
        this._sendMsgToPerformanceWindow({
          command: 'mw_initData',
          profileId: args.profileId,
          dataObject: dump(performancePanel, { serializer })
        });
        this.externalPerformanceWindows.set(args.profileId, { status: 'ready' });
      } else if (args.command === 'pw_windowClosed') {
        // this command should only come from Performance Window if window is closed by user using cross.
        this.externalPerformanceWindows.set(args.profileId, { status: 'closed' });
        this.transformPerformancePanel(args.profileId, performancePanelStatuses.background);
      } else if (args.command === 'pw_windowReload') {
        this.externalPerformanceWindows.set(args.profileId, { status: 'reloading' });
      }
    }
  }
  @action.bound
  _sendMsgToPerformanceWindow(args) {
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      const { ipcRenderer } = electron;
      ipcRenderer.send('performance', args);
    }
  }

  @action.bound
  hasPerformancePanel(profileId: UUID): boolean {
    const { performancePanels } = this.store;

    return performancePanels.has(profileId);
  }

  @action.bound
  transformPerformancePanel(profileId: UUID, to: ?PerformancePanelStatus) {
    const { performancePanels } = this.store;
    let performancePanel = performancePanels.get(profileId);

    if (!performancePanel) {
      // none => stopped
      this._addPerformancePanel(profileId);
      performancePanel = performancePanels.get(profileId);
    }

    const { status } = performancePanel;

    if (status === to) return;

    if (status === performancePanelStatuses.stopped) {
      if (to === performancePanelStatuses.background) {
        // stopped => background

        this._runPerformancePanel(profileId, performancePanelStatuses.background);
      } else if (to === performancePanelStatuses.foreground) {
        // stopped => foreground

        this._runPerformancePanel(profileId, performancePanelStatuses.foreground);
        this._mountPerformancePanelToMainWindow(profileId);
        this._addPowerBlocker(profileId);
      } else if (to === performancePanelStatuses.external) {
        // stopped => external

        this._runPerformancePanel(profileId, performancePanelStatuses.external);
        this._mountPerformancePanelToExternalWindow(profileId);
        this._addPowerBlocker(profileId);
      } else if (to == null) {
        // stopped => none

        this._removePerformancePanel(profileId);
      }
    } else if (status === performancePanelStatuses.background) {
      if (to === performancePanelStatuses.foreground) {
        // background => foreground

        this._runPerformancePanel(profileId, performancePanelStatuses.foreground);
        this._mountPerformancePanelToMainWindow(profileId);
        this._addPowerBlocker(profileId);
      } else if (to === performancePanelStatuses.external) {
        // background => external

        this._runPerformancePanel(profileId, performancePanelStatuses.external);
        this._mountPerformancePanelToExternalWindow(profileId);
        this._addPowerBlocker(profileId);
      } else if (to === performancePanelStatuses.stopped) {
        // background => stopped

        this._stopPerformancePanel(profileId);
      } else if (to == null) {
        // background => none

        this._stopPerformancePanel(profileId);
        this._removePerformancePanel(profileId);
      }
    } else if (status === performancePanelStatuses.foreground) {
      if (to === performancePanelStatuses.background) {
        // foreground => background

        this._runPerformancePanel(profileId, performancePanelStatuses.background);
        this._unmountPerformancePanelFromMainWindow();
        this._removePowerBlocker(profileId);
      } else if (to === performancePanelStatuses.external) {
        // foreground => external

        this._unmountPerformancePanelFromMainWindow();
        performancePanel.status = to;
        this._mountPerformancePanelToExternalWindow(profileId);
      } else if (to === performancePanelStatuses.stopped) {
        // foreground => stopped

        this._stopPerformancePanel(profileId);
        this._unmountPerformancePanelFromMainWindow();
      } else if (to == null) {
        // foreground => none

        this._stopPerformancePanel(profileId);
        this._unmountPerformancePanelFromMainWindow();
        this._removePerformancePanel(profileId);
      }
    } else if (status === performancePanelStatuses.external) {
      if (to === performancePanelStatuses.background) {
        // external => background

        this._runPerformancePanel(profileId, performancePanelStatuses.background);
        this._unmountPerformancePanelFromExternalWindow(profileId);
        this._removePowerBlocker(profileId);
      } else if (to === performancePanelStatuses.foreground) {
        // external => foreground

        this._unmountPerformancePanelFromExternalWindow(profileId);
        performancePanel.status = to;
        this._mountPerformancePanelToMainWindow(profileId);
      } else if (to === performancePanelStatuses.stopped) {
        // external => stopped

        this._stopPerformancePanel(profileId);
        this._unmountPerformancePanelFromExternalWindow(profileId);
      } else if (to == null) {
        // external => none

        this._stopPerformancePanel(profileId);
        this._unmountPerformancePanelFromExternalWindow(profileId);
        this._removePerformancePanel(profileId);
      }
    }
  }

  resetHighWaterMark = (profileId: UUID) => {
    const statsSrv = featherClient();
    statsSrv.statsService.patch(profileId, { resetStats: true }).catch(err => {
      this._handleError(profileId, err);
    });
  };
}
