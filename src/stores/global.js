/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-23T11:06:27+11:00
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
import { action, observable, when, runInAction, toJS, reaction } from 'mobx';
import { dump, restore, nodump } from 'dumpenvy';
import {
  serializer,
  deserializer,
  postDeserializer
} from '#/common/mobxDumpenvyExtension';
import { EditorTypes, DrawerPanes } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';
import moment from 'moment';
import Globalize from 'globalize';
import DataCenter from '~/api/DataCenter';
import { Broker, EventType } from '../helpers/broker';
import { ProfileStatus } from '../components/common/Constants';
import Config from './config';
import Profiles from './profiles';

let ipcRenderer;
let stateStorePath;

if (IS_ELECTRON) {
  const electron = window.require('electron');

  ipcRenderer = electron.ipcRenderer; // eslint-disable-line prefer-destructuring

  const { remote } = electron;

  global.PATHS = remote.getGlobal('PATHS');
  stateStorePath = global.PATHS.stateStore;

  global.UAT = remote.getGlobal('UAT');
} else {
  global.UAT = false;
}

global.EOL = global.IS_ELECTRON
  ? window.require('os').EOL
  : process.platform === 'win32' ? '\r\n' : '\n';

export default class Store {
  @nodump api = null;
  @nodump profileStore = null;
  @observable locale = 'en';
  @observable version = '0.10.1';
  @observable updateAvailable = false;
  @observable editors = observable.map();
  @observable outputs = observable.map();
  @observable terminals = observable.shallowMap();
  // @observable widgets = observable.shallowMap();
  @observable performancePanels = observable.shallowMap();

  @observable performancePanel = null;

  @observable
  welcomePage = observable({
    isOpen: true,
    newsFeed: [],
    currentContent: 'Welcome' // Can be 'Welcome', 'Choose Theme' or 'Keyboard Shortcuts'
  });

  @nodump
  @observable
  configPage = observable.shallowObject({
    isOpen: true,
    selectedMenu: 'Paths',
    changedFields: observable.shallowArray(),
    newSettings: null
  });

  @observable
  editorPanel = observable({
    creatingNewEditor: false,
    res: null,
    activeEditorId: 'Default',
    activeDropdownId: 'Default',
    executingEditorAll: false,
    executingEditorLines: false,
    executingExplain: undefined,
    stoppingExecution: false,
    removingTabId: false,
    isRemovingCurrentTab: false,
    tabFilter: '',
    showingSavingDialogEditorIds: [],
    lastFileSavingDirectoryPath: IS_ELECTRON ? global.PATHS.userHome : '',
    shouldScrollToActiveTab: false,
    tabScrollLeftPosition: 0,
    updateAggregateDetails: false,
    updateAggregateCode: false
  });

  @observable
  editorToolbar = observable({
    reloadToolbar: false,
    newConnectionLoading: false,
    currentProfile: 0,
    noActiveProfile: true,
    isActiveExecuting: false,
    id: 0,
    shellId: 0,
    newEditorForTreeAction: false,
    newEditorForProfileId: '',
    saveAs: false
  });

  @observable
  outputPanel = observable({
    currentTab: 'Default',
    clearingOutput: false,
    executingShowMore: false,
    executingTerminalCmd: false,
    sendingCommand: '',
    collapseTable: false,
    expandTable: false
  });

  @observable
  layout = {
    alertIsLoading: false,
    optInVisible: true,
    overallSplitPos: '35%',
    leftSplitPos: '50%',
    rightSplitPos: '60%'
  };

  @observable
  drawer = observable({
    drawerChild: DrawerPanes.DEFAULT
  });

  @observable
  treeActionPanel = {
    treeNode: null,
    treeAction: null,
    treeActionEditorId: '',
    // newEditorCreated: false,
    formValues: '',
    isNewFormValues: false,
    editors: observable.map(),
    refreshOnExecution: false
  };

  @observable
  aggregateBuilder = {
    includeCreateView: true,
    viewName: '',
    showViewNameDialog: false
  };

  @observable
  detailsPanel = {
    lastTreeAction: null,
    lastTreeNode: null,
    detailsViewInfo: null,
    activeEditorId: ''
  };

  @observable
  storagePanel = {
    selectedDatabase: null
  };

  @observable
  treePanel = {
    isRefreshing: false,
    isRefreshDisabled: true,
    downloadingDrill: false,
    showDrillStatus: false,
    drillDownloadProgress: null,
    drillStatusMsg: ''
  };

  @observable
  explainPanel = {
    activeId: undefined,
    explainAvailable: false
  };

  @observable
  mongoShellPrompt = {
    prompt: 'dbkoda>'
  };

  @observable
  profileList = observable({
    selectedProfile: null,
    creatingNewProfile: false
  });

  @observable
  dragItem = observable({
    dragDrop: false,
    dragDropTerminal: false,
    item: null
  });

  @observable
  password = {
    showDialog: false,
    showResetDialog: false,
    passwordVerified: false,
    missingProfiles: [],
    initialPassword: '',
    repeatPassword: ''
  };

  @observable
  topology = observable({ isChanged: false, json: {}, profileId: '' });

  @action.bound
  setDrawerChild = value => {
    this.drawer.drawerChild = value;
  };

  @action.bound
  showConnectionPane = () => {
    this.setDrawerChild(DrawerPanes.PROFILE);
  };

  @action.bound
  hideConnectionPane = () => {
    this.setDrawerChild(DrawerPanes.DEFAULT);
  };

  @action.bound
  showTreeActionPane = type => {
    if (type == EditorTypes.TREE_ACTION) {
      this.setDrawerChild(DrawerPanes.DYNAMIC);
    } else if (type == EditorTypes.SHELL_COMMAND) {
      this.setDrawerChild(DrawerPanes.BACKUP_RESTORE);
    }
  };

  @action.bound
  setTreeAction = (treeNode, treeAction) => {
    this.treeActionPanel.treeNode = treeNode;
    this.treeActionPanel.treeAction = treeAction;
  };

  @action.bound
  updateDynamicFormCode = value => {
    this.treeActionPanel.formValues = value;
    this.treeActionPanel.isNewFormValues = true;
  };

  @action.bound
  updateTopology = res => {
    this.topology.profileId = res.profileId;
    this.topology.json = res.result;
    this.topology.isChanged = true;
  };

  @action.bound
  addEditor = (withProfile, newRes) => {
    this.editorPanel.creatingNewEditor = true;
    this.editorPanel.creatingWithProfile = withProfile;
    this.editorPanel.res = newRes;
  };

  // Actions for creating new editors, currently used by ProfileListPanel/ListView.jsx
  // When time allows editor/Toolbar.jsx should also be refactored to use these same actions.
  @action.bound
  startCreatingNewEditor = () => {
    this.editorPanel.creatingNewEditor = true;
    this.editorToolbar.newConnectionLoading = true;
  };

  @action.bound
  openNewAggregateBuilder(nodeRightClicked) {
    if (this.editorPanel.activeDropdownId === 'Default') {
      NewToaster.show({
        message:
          'Error: Please select an open connection from the Profile Dropdown.',
        className: 'danger',
        iconName: 'pt-icon-thumbs-down'
      });
    }
    this.startCreatingNewEditor();
    // Create a new shell through feathers.
    return featherClient()
      .service('/mongo-shells')
      .create({
        id: this.profileStore.profiles.get(this.editorPanel.activeDropdownId).id
      })
      .then(res => {
        // Create new editor as normal, but with "aggregate" type.
        return this.api.setNewEditorState(res, {
          type: 'aggregate',
          collection: {
            text: nodeRightClicked.text,
            refParent: { text: nodeRightClicked.refParent.text }
          },
          blockList: []
        });
      })
      .catch(err => {
        this.api.createNewEditorFailed();
        console.error(err);
        NewToaster.show({
          message: 'Error: ' + err.message,
          className: 'danger',
          iconName: 'pt-icon-thumbs-down'
        });
        logToMain('error', 'Failed to create new editor: ' + err);
      });
  }

  @action.bound
  dump() {
    return dump(this, { serializer });
  }

  openFile = (path, cb) => {
    return featherClient()
      .service('files')
      .get(path)
      .then(res => cb(res))
      .catch(err => {
        NewToaster.show({
          message: err.message,
          className: 'danger',
          iconName: 'pt-icon-thumbs-down'
        });
        throw err;
      });
  };

  watchFileBackgroundChange = editorId => {
    const editor = this.editors.get(editorId);
    if (editor && editor.path) {
      const handleFileChangedEvent = () => {
        this.openFile(editor.path, ({ content }) => {
          runInAction(`Apply file background change for ${editorId}`, () => {
            editor.doc.setValue(content);
            editor.doc.markClean();
          });
        });
      };
      const eventName = EventType.createFileChangedEvent(editor.path);
      Broker.on(eventName, handleFileChangedEvent);

      // smart recycle
      when(
        `Unwatch file changes for ${editorId}`,
        () => !this.editors.has(editorId),
        () => {
          Broker.off(eventName, handleFileChangedEvent);
        }
      );
    }
  };

  // TODO: verify this logic
  @action.bound
  closeConnection() {
    return new Promise(resolve => {
      if (
        this.profileStore &&
        this.profileStore.profiles &&
        this.profileStore.profiles.size > 0
      ) {
        const promises = [];
        this.profileStore.profiles.forEach(value => {
          if (value.status === ProfileStatus.OPEN) {
            // close this connection from feather-client
            value.status = ProfileStatus.CLOSED;
            const service = featherClient().service('/mongo-connection');
            if (service) {
              promises.push(service.remove(value.id));
            }
          }
        });
        if (promises.length > 0) {
          Promise.all(promises)
            .then(() => resolve())
            .catch(() => resolve());
        } else {
          resolve();
        }
        this.api.deleteProfileFromDrill({ removeAll: true });
      } else {
        resolve();
      }
    });
  }

  @action.bound
  updateAndRestart() {
    this.updateAvailable = false;
    ipcRenderer.send('updateAndRestart');
  }

  @action.bound
  restore(data) {
    const newStore = restore(data, { deserializer, postDeserializer });

    try {
      this.cleanStore(newStore);
      _.assign(this, newStore);
    } catch (err) {
      console.error(err);
      logToMain('error', err.message);
    }

    return Promise.resolve();
  }

  cleanStore(newStore) {
    Globalize.locale(newStore.locale || 'en');

    newStore.layout.alertIsLoading = false;

    // Version:
    newStore.version = '0.10.1';

    // EditorPanel:
    newStore.editorPanel.activeDropdownId = 'Default';
    newStore.editorPanel.creatingNewEditor = false;
    newStore.editorPanel.executingEditorAll = false;
    newStore.editorPanel.executingEditorLines = false;
    newStore.editorPanel.stoppingExecution = false;
    newStore.editorPanel.tabFilter = '';
    newStore.editorPanel.showingSavingDialogEditorIds = observable.shallowArray();
    newStore.editorPanel.updateAggregateDetails = false;
    newStore.editorToolbar.newEditorForTreeAction = false;
    newStore.editorPanel.lastFileSavingDirectoryPath =
      newStore.editorPanel.lastFileSavingDirectoryPath ||
      (IS_ELECTRON ? global.PATHS.userHome : '');
    newStore.editorPanel.shouldScrollToActiveTab = false;
    if (newStore.editorPanel.tabScrollLeftPosition === undefined) {
      newStore.editorPanel.tabScrollLeftPosition = 0;
    }

    // EditorToolbar:
    newStore.editorToolbar.currentProfile = 0;
    newStore.editorToolbar.id = 0;
    newStore.editorToolbar.shellId = 0;
    newStore.editorToolbar.reloadToolbar = false;
    newStore.editorToolbar.isActiveExecuting = false;
    newStore.editorToolbar.isExplainExecuting = false;
    newStore.editorToolbar.newConnectionLoading = false;
    newStore.editorToolbar.noActiveProfile = true;

    // Editors:
    newStore.editors.forEach(value => {
      value.executing = false;
      value.status = ProfileStatus.CLOSED;
    });

    // Outputs:
    newStore.outputs.forEach((value, key, map) => {
      map.set(key, observable(value));
    });

    // OutputPanel:
    newStore.outputPanel.clearingOutput = false;
    newStore.outputPanel.executingShowMore = false;
    newStore.outputPanel.executingTerminalCmd = false;

    // ProfileList
    newStore.profileList.creatingNewProfile = false;

    // Tree Panel:
    newStore.treePanel.isRefreshing = false;
    newStore.treePanel.isRefreshDisabled = true;
    newStore.treePanel.downloadingDrill = false;
    newStore.treePanel.showDrillStatus = false;
    newStore.treePanel.drillDownloadProgress = null;
    newStore.treePanel.drillStatusMsg = '';

    // Tree Action Panel:
    newStore.treeActionPanel.isNewFormValues = false;

    // Aggregate Builder:
    newStore.aggregateBuilder.showViewNameDialog = false;
  }

  hasUnsavedEditorTabs() {
    let isClean = true;

    for (const e of this.editors.values()) {
      if (!isClean) {
        break;
      }
      isClean = isClean && e.doc.isClean();
    }

    return !isClean;
  }

  backup() {
    if (IS_ELECTRON) {
      const path = window.require('path');

      const stateStoreDir = path.dirname(stateStorePath);
      const dateStr = moment().format('DD-MM-YYYY_HH-mm-ss');
      const backupPath = path.resolve(
        stateStoreDir,
        `stateStore.${dateStr}.json`
      );
      return featherClient()
        .service('files')
        .get(stateStorePath, {
          query: {
            copyTo: backupPath,
            watching: 'false'
          }
        });
    }

    return Promise.reject(new Error('Backup only supported in Electron'));
  }

  @action.bound
  resetConfigPage(settingsObj) {
    this.configPage.changedFields.clear();
    this.configPage.newSettings = observable.object(
      settingsObj || toJS(this.config.settings)
    );
  }

  loadRest() {
    // init config
    this.config = new Config();
    global.config = this.config;

    // init profiles
    this.profileStore = new Profiles();
    global.profileStore = this.profileStore;

    // init api
    this.api = new DataCenter(this, this.config, this.profileStore);
    global.api = this.api;

    return this.config
      .load()
      .then(() => {
        const foregroundSamplingRateChangedReaction = reaction(
          () => this.config.settings.performancePanel.foregroundSamplingRate,
          rate => this.api.reactToSamplingRateChange(rate, true)
        );

        const backgroundSamplingRateChangedReaction = reaction(
          () => this.config.settings.performancePanel.backgroundSamplingRate,
          rate => this.api.reactToSamplingRateChange(rate, false)
        );

        // stop all PP when refreshing
        Broker.once(EventType.WINDOW_REFRESHING, () => {
          foregroundSamplingRateChangedReaction();
          backgroundSamplingRateChangedReaction();
        });

        // init configPage so that Preferences panel can render
        // TODO: redesign Preferences panel and get rid of this
        this.resetConfigPage();

        if (this.config.settings.passwordStoreEnabled) {
          this.api.passwordApi.showPasswordDialog();
        }
      })
      .then(() => this.profileStore.load())
      .then(
        action(() => {
          // recover selectedProfile
          if (this.profileList.selectedProfile) {
            this.profileList.selectedProfile = this.profileStore.profiles.get(
              this.profileList.selectedProfile.id
            );
          }

          this.saveUponEditorsChange();

          // FIXME
          // this.saveUponProfileChange();

          if (this.api) {
            this.api.init();
          }

          Broker.emit(EventType.APP_READY);
        })
      )
      .then(
        action(() => {
          const ps = [];

          // Remove terminals doesn't exist on Controller
          for (const terminalId of this.terminals.keys()) {
            ps.push(
              featherClient()
                .terminalService.get(terminalId)
                .catch(
                  action(err => {
                    logToMain('error', 'Failed to fetch terminals: ' + err);
                    if (err.code !== 404) {
                      console.error(err);
                    }

                    this.terminals.delete(terminalId);

                    return this.api.getTerminalTabId(terminalId);
                  })
                )
            );
          }

          return Promise.all(ps).then(
            action(removedIds => {
              const { currentTab } = this.outputPanel;

              if (currentTab && _.includes(removedIds, currentTab)) {
                // go back to `Raw` if current Terminal is removed
                this.outputPanel.currentTab = this.editorPanel.activeEditorId;
              }
            })
          );
        })
      );
  }

  /**
   * Load state store from user fs
   *
   * NOTE this should only be called once during current app lifetime
   */
  load() {
    featherClient()
      .service('files')
      .get(stateStorePath, {
        query: {
          watching: 'false'
        }
      })
      .then(({ content }) => {
        return this.restore(content).then(() => this.loadRest());
      })
      .catch(err => {
        if (err.code === 404) {
          console.error(
            "State store doesn't exist. A new one will be created after app close or refreshing"
          );
          logToMain('error', 'State store does not exist: ' + err);
          return this.loadRest().then(() => {
            Broker.emit(EventType.APP_READY);
          });
        }

        console.error(err);
        logToMain('error', 'Failed to load state store: ' + stateStorePath + ',' + err);
        Broker.emit(EventType.APP_CRASHED);
      });
  }

  /**
   * Aynchronously save state store to user fs
   */
  save() {
    return featherClient()
      .service('files')
      .create({
        _id: stateStorePath,
        content: this.dump(),
        watching: false
      })
      .then(() => {})
      .catch(console.error);
  }

  /**
   * Synchronously save state store to user fs. Only available in Electron
   */
  saveSync() {
    if (IS_ELECTRON) {
      const fs = window.require('fs');

      const content = this.dump();
      fs.writeFileSync(stateStorePath, content);
    }
  }

  saveUponEditorsChange() {
    this.editors.observe(this.saveDebounced);
  }

  constructor(initOnly: false) {
    this.save = this.save.bind(this);
    this.saveDebounced = _.debounce(this.save, 500);

    if (initOnly) return;

    Broker.on(EventType.FEATHER_CLIENT_LOADED, value => {
      if (value) {
        this.load();
      }
    });

    if (IS_ELECTRON) {
      ipcRenderer.once('update', (event, message) => {
        if (message === 'updateReady') {
          runInAction('Update Downloaded and ready to install', () => {
            this.updateAvailable = true;
          });
        }
      });
    }
  }

  @action.bound
  runEditorScript() {
    this.editorPanel.executingEditorAll = true;
  }
}
