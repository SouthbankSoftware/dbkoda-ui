/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-25T09:46:42+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-03T14:05:33+10:00
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
import OutputApi from './Output';
import TerminalApi from './Terminal';
import PerformancePanelApi from './PerformancePanel';
import WidgetApi from './Widget';
import EditorApi from './Editor';
import ProfileApi from './Profile';
import TreeApi from './Tree';
import DrillApi from './Drill';
import PasswordApi from './Password';
import TopConnectionsApi from './TopConnections';
import ProfilingApi from './Profiling';
import AggregationApi from './Aggregation';
import StorageDrilldownApi from './StorageDrilldown';
import StaticApi from './static';

export default class DataCenter {
  store;
  configStore;
  outputApi;
  profileStore;

  constructor(store, configStore, profileStore) {
    this.store = store;
    this.configStore = configStore;
    this.profileStore = profileStore;
    this.outputApi = new OutputApi(store, this, profileStore);
    this.terminalApi = new TerminalApi(store, this, configStore);
    this.performancePanelApi = new PerformancePanelApi(store, this, configStore);
    this.widgetApi = new WidgetApi(store, this);
    this.editorApi = new EditorApi(store, this, configStore, profileStore);
    this.profileApi = new ProfileApi(store, this, profileStore, configStore);
    this.treeApi = new TreeApi(store, this, profileStore);
    this.drillApi = new DrillApi(store, this);
    this.passwordApi = new PasswordApi(store, this, configStore);
    this.topConnectionsApi = new TopConnectionsApi(store, this);
    this.profilingApi = new ProfilingApi(store, this);
    this.aggregationApi = new AggregationApi(store, this);
    this.storageDrilldownApi = new StorageDrilldownApi(store, this);

    this.init = this.init.bind(this);

    // TODO this is basically a mixin pattern, use a mixin lib instead of typing heedlessly here? :D

    // Output API public functions
    _.assign(
      this,
      _.pick(this.outputApi, [
        'addOutput',
        'removeOutput',
        'initJsonView',
        'swapOutputShellConnection',
        'addDrillOutput',
        'drillOutputAvailable'
      ])
    );

    // StorageDrilldown public APIs
    _.assign(this, _.pick(this.storageDrilldownApi, ['getStorageData', 'getChildStorageData']));

    // TopConnections public APIs
    _.assign(this, _.pick(this.topConnectionsApi, ['getTopConnections', 'killOperation']));

    // Profling public APIs
    _.assign(this, _.pick(this.profilingApi, ['getProfilingDataBases', 'getProfilingData']));

    // Aggregation Public APIs
    _.assign(
      this,
      _.pick(this.aggregationApi, [
        'generateCode',
        'onHideLeftPanelClicked',
        'onShowLeftPanelClicked',
        'updateAggregateConfig'
      ])
    );

    // Terminal public APIs
    _.assign(
      this,
      _.pick(this.terminalApi, [
        'getTerminalTabId',
        'addSshTerminal',
        'addTerminal',
        'removeTerminal',
        'removeAllTerminalsForProfile'
      ])
    );

    // PerformancePanel public APIs
    _.assign(
      this,
      _.pick(this.performancePanelApi, [
        'hasPerformancePanel',
        'transformPerformancePanel',
        'resetHighWaterMark',
        'resetPerformancePanel',
        'changeSamplingRate',
        'reactToSamplingRateChange',
        'showToasterInPerformanceWindow',
        'sendMsgToPerformanceWindow',
        'setProfilingDatabseConfiguration'
      ])
    );

    // Widget public APIs
    _.assign(this, _.pick(this.widgetApi, ['addWidget', 'removeWidget']));

    // Editor API public functions
    _.assign(
      this,
      _.pick(this.editorApi, [
        'addEditor',
        'setNewEditorState',
        'createNewEditorFailed',
        'getUnsavedEditorInternalFileName',
        'getUnsavedEditorSuggestedFileName',
        'getEditorDisplayName',
        'removeEditor',
        'addDrillEditor',
        'openHomeTab'
      ])
    );

    // Tree API public functions
    _.assign(this, _.pick(this.treeApi, ['addNewEditorForTreeAction', 'showStorageStatsView']));

    // Profile API public functions
    _.assign(
      this,
      _.pick(this.profileApi, [
        'profileCreated',
        'setToasterCallback',
        'connectProfile',
        'saveProfile',
        'getProfiles'
      ])
    );

    // Drill API public functions
    _.assign(
      this,
      _.pick(this.drillApi, [
        'addNewEditorForDrill',
        'checkForExistingDrillProfile',
        'openEditorWithDrillProfileId',
        'deleteProfileFromDrill'
      ])
    );

    // Static APIs
    this.static = StaticApi;
  }

  init() {
    this.outputApi.init(['_getLineText']);
  }
}
