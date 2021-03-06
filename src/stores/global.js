/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-18T10:32:53+10:00
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
import { action, observable, when, runInAction, reaction } from 'mobx';
import { dump, restore, nodump } from 'dumpenvy';
import { serializer, deserializer, postDeserializer } from '#/common/mobxDumpenvyExtension';
import { EditorTypes, DrawerPanes, NavPanes } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';
import moment from 'moment';
import DataCenter from '~/api/DataCenter';
import { setUser, toggleRaygun } from '~/helpers/loggingApi';
import { resizerStates } from '#/common/EnhancedSplitPane';
import { Broker, EventType } from '../helpers/broker';
import { ProfileStatus } from '../components/common/Constants';
import ConfigStore from './config';
import ProfileStore from './profile';

let ipcRenderer;

if (IS_ELECTRON) {
  const electron = window.require('electron');

  ipcRenderer = electron.ipcRenderer; // eslint-disable-line prefer-destructuring
}

const stateStorePath = global.PATHS.stateStore;

global.EOL = global.IS_ELECTRON
  ? window.require('os').EOL
  : process.platform === 'win32'
    ? '\r\n'
    : '\n';

// just in case webpack is not in context
global.VERSION = '';

export default class Store {
  @nodump api = null;
  @nodump profileStore = null;
  @nodump configStore = null;
  @observable locale = 'en';
  // NOTE: this is not a global variable but a placeholder string that will be replaced by webpack
  // DefinePlugin. The version is retrieved automatically from package.json at the building time of
  // ui bundle
  // eslint-disable-next-line no-undef
  @observable version = VERSION;
  @observable previousVersion = null;
  @observable updateAvailable = false;
  @observable.shallow editors = observable.map(null, { deep: false });
  @observable.shallow outputs = observable.map(null, { deep: false });
  @observable.shallow terminals = observable.map(null, { deep: false });
  @observable.shallow performancePanels = observable.map(null, { deep: false });
  @observable.shallow performancePanel = null;

  @observable
  configPanel = observable({
    currentMenuEntry: 'general',
    changes: observable.map(null),
    errors: observable.map(null)
  });

  @observable
  editorPanel = observable(
    {
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
      updateAggregateCode: false,
      showNewFeaturesDialog: true
    },
    {},
    { deep: false }
  );

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
  outputPanel = observable(
    {
      currentTab: 'Default',
      clearingOutput: false,
      executingShowMore: false,
      executingTerminalCmd: false,
      sendingCommand: '',
      collapseTable: false,
      expandTable: false,
      editorRefs: {},
      __nodump__: ['editorRefs', '__nodump__']
    },
    {
      editorRefs: observable.ref,
      __nodump__: observable.ref
    },
    { deep: false }
  );

  @observable
  layout = {
    alertIsLoading: false,
    optInVisible: !global.UAT,
    overallSplitPos: '25%',
    overallSplitResizerState: resizerStates.ALL_SHOWN,
    leftSplitPos: '50%',
    leftSplitResizerState: resizerStates.ALL_SHOWN,
    rightSplitPos: '35%',
    rightSplitResizerState: resizerStates.ALL_SHOWN
  };

  @observable
  drawer = observable({
    drawerChild: DrawerPanes.DEFAULT,
    activeNavPane: NavPanes.EDITOR
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
    includeCreateView: false,
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
    drillStatusMsg: '',
    action: null
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

  @nodump
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

  @nodump
  @observable
  topology = observable({
    isChanged: false,
    json: {},
    profileId: ''
  });

  @nodump topologyCache = {};

  @action.bound
  setDrawerChild = value => {
    this.drawer.drawerChild = value;
  };

  @action.bound
  setActiveNavPane = value => {
    if (this.drawer.activeNavPane === NavPanes.EDITOR && value === NavPanes.EDITOR) {
      // toggle home button

      if (this.layout.overallSplitResizerState === resizerStates.P_HIDDEN) {
        this.layout.overallSplitResizerState = resizerStates.ALL_SHOWN;
        this.layout.rightSplitResizerState = resizerStates.ALL_SHOWN;
      } else {
        this.layout.overallSplitResizerState = resizerStates.P_HIDDEN;
        this.layout.rightSplitResizerState = resizerStates.ALL_SHOWN;
      }
    }
    if (value === NavPanes.PERFORMANCE_LINK) {
      l.debug('Open Perf Panel');
      return;
    }

    this.drawer.activeNavPane = value;
  };

  @action.bound
  showConnectionPane = () => {
    this.setActiveNavPane(NavPanes.PROFILE);
  };

  @action.bound
  hideConnectionPane = () => {
    this.setDrawerChild(DrawerPanes.DEFAULT);
    this.setActiveNavPane(NavPanes.EDITOR);
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
    l.debug(treeNode, treeAction);
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
    if (!res.updated) {
      this.topology.isChanged = true;
    }
    this.topologyCache[res.profileId] = {
      profileId: res.profileId,
      json: res.result,
      updated: res.updated ? res.updated : Date.now()
    };
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

  // TO DO
  @action.bound
  openNewAggregateBuilder(nodeRightClicked) {
    l.debug(this.profile);
    if (!this.profileList.selectedProfile) {
      NewToaster.show({
        message: 'Error: Please select an open connection from the Profile Dropdown.',
        className: 'danger',
        icon: 'thumbs-down'
      });
    }
    this.startCreatingNewEditor();
    // Create a new shell through feathers.
    const service = featherClient().service('/mongo-shells');
    service.timeout = 15000;
    service
      .create({
        id: this.profileList.selectedProfile.id
      })
      .then(res => {
        l.debug('Created new editor for Aggregate Builder: ', res);
        // Create new editor as normal, but with "aggregate" type.
        return this.api.setNewEditorState(res, {
          type: 'aggregate',
          collection: {
            text: nodeRightClicked.text,
            refParent: { text: nodeRightClicked.refParent.text }
          },
          isAggregateLoading: true,
          isAggregateDetailsLoading: true,
          blockList: []
        });
      })
      .catch(err => {
        this.api.createNewEditorFailed();
        l.error('Failed to create new editor:', err);
        NewToaster.show({
          message: 'Error: ' + err.message,
          className: 'danger',
          icon: 'thumbs-down'
        });
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
          icon: 'thumbs-down'
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
        () => !this.editors.has(editorId),
        () => {
          Broker.off(eventName, handleFileChangedEvent);
          featherClient()
            .service('files')
            .patch(editor.path, {
              watching: false
            })
            .catch(l.error);
        },
        {
          name: `Unwatch file changes for ${editorId}`
        }
      );
    }
  };

  // TODO: verify this logic
  @action.bound
  closeConnection() {
    return new Promise(resolve => {
      if (this.profileStore && this.profileStore.profiles && this.profileStore.profiles.size > 0) {
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
      _.assign(this, _.pick(newStore, _.keys(this)));
    } catch (err) {
      l.error(err);
    }

    return Promise.resolve();
  }

  cleanStore(newStore) {
    if (newStore.version !== this.version) {
      // upgrading from previous versions

      // reset config panel states
      delete newStore.configPanel;
    }

    // TODO: enable this when we hv internationalization support
    // Globalize.locale(newStore.locale || 'en');

    newStore.layout.alertIsLoading = false;
    newStore.layout.overallSplitResizerState = resizerStates.ALL_SHOWN;
    newStore.layout.leftSplitResizerState = resizerStates.ALL_SHOWN;
    newStore.layout.rightSplitResizerState = resizerStates.ALL_SHOWN;

    // NOTE: this is not a global variable but a placeholder string that will be replaced by webpack
    // DefinePlugin. The version is retrieved automatically from package.json at the building time of
    // ui bundle
    // eslint-disable-next-line no-undef
    newStore.version = VERSION;

    if (newStore.drawer && !newStore.drawer.activeNavPane) {
      newStore.drawer = observable({
        drawerChild: DrawerPanes.DEFAULT,
        activeNavPane: NavPanes.EDITOR
      });
    }

    // Do not open initial view to an aggregate editor.
    if (
      newStore.editors.get(newStore.editorPanel.activeEditorId) &&
      newStore.editors.get(newStore.editorPanel.activeEditorId).aggregateID >= 0
    ) {
      newStore.drawer.activeNavPane = NavPanes.EDITOR;
      newStore.drawer.drawerChild = DrawerPanes.DEFAULT;
      newStore.editorPanel.activeEditorId = 'Default';
    }
    // EditorPanel:
    newStore.editorPanel.activeDropdownId = 'Default';
    newStore.editorPanel.creatingNewEditor = false;
    newStore.editorPanel.executingEditorAll = false;
    newStore.editorPanel.executingEditorLines = false;
    newStore.editorPanel.stoppingExecution = false;
    newStore.editorPanel.tabFilter = '';
    newStore.editorPanel.showingSavingDialogEditorIds = observable.array(null, {
      deep: false
    });
    newStore.editorPanel.showNewFeaturesDialog = true;
    newStore.editorPanel.updateAggregateDetails = false;
    newStore.editorPanel.lastFileSavingDirectoryPath =
      newStore.editorPanel.lastFileSavingDirectoryPath ||
      (IS_ELECTRON ? global.PATHS.userHome : '');
    newStore.editorPanel.shouldScrollToActiveTab = false;
    if (newStore.editorPanel.tabScrollLeftPosition === undefined) {
      newStore.editorPanel.tabScrollLeftPosition = 0;
    }

    // EditorToolbar:
    newStore.editorToolbar.currentProfile = 0;
    newStore.editorToolbar.newEditorForTreeAction = false;
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
      value.isAggregateLoading = false;
      value.isAggregateDetailsLoading = false;
    });

    // Outputs:
    newStore.outputs.forEach((value, key, map) => {
      map.set(key, observable(value));
    });

    // OutputPanel:
    newStore.outputPanel.editorRefs = {};
    newStore.outputPanel.__nodump__ = ['editorRefs', '__nodump__'];
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
    newStore.treePanel.action = null;

    // Tree Action Panel:
    newStore.treeActionPanel.isNewFormValues = false;

    // Aggregate Builder:
    if (newStore.aggregateBuilder) {
      newStore.aggregateBuilder.showViewNameDialog = false;
    }
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
      const backupPath = path.resolve(stateStoreDir, `stateStore.${dateStr}.json`);
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

  loadRest() {
    // init config
    this.configStore = new ConfigStore();
    global.configStore = this.configStore;

    // init profiles
    this.profileStore = new ProfileStore();
    global.profileStore = this.profileStore;

    return this.configStore
      .load()
      .then(() => {
        // init api
        this.api = new DataCenter(this, this.configStore, this.profileStore);
        global.api = this.api;

        // check and generate missing config.mongo.cmd or config.mongo.docker.cmd
        if (_.get(this.configStore, 'config.mongo.dockerized')) {
          if (_.get(this.configStore, 'config.mongo.docker.cmd') === null) {
            const request = {};
            _.set(request, 'config.mongo.docker.cmd', null);

            this.configStore.patch(request.config);
          }
        } else if (_.get(this.configStore, 'config.mongo.cmd') === null) {
          const request = {};
          _.set(request, 'config.mongo.cmd', null);

          this.configStore.patch(request.config);
        }

        let settingsUserChangedReaction;
        let settingsTelemetryEnabledReaction;

        if (!IS_STORYBOOK) {
          settingsUserChangedReaction = reaction(
            () => this.configStore.config.user.id,
            () => {
              setUser(this.configStore.config.user);
            },
            { fireImmediately: true }
          );

          settingsTelemetryEnabledReaction = reaction(
            () => this.configStore.config.telemetryEnabled,
            enabled => {
              toggleRaygun(enabled);
            },
            { fireImmediately: true }
          );
        }

        const foregroundSamplingRateChangedReaction = reaction(
          () => this.configStore.config.performancePanel.foregroundSamplingRate,
          rate => this.api.reactToSamplingRateChange(rate, true)
        );

        const backgroundSamplingRateChangedReaction = reaction(
          () => this.configStore.config.performancePanel.backgroundSamplingRate,
          rate => this.api.reactToSamplingRateChange(rate, false)
        );

        // stop all PP when refreshing
        Broker.once(EventType.WINDOW_REFRESHING, () => {
          if (!IS_STORYBOOK) {
            settingsTelemetryEnabledReaction();
            settingsUserChangedReaction();
          }
          foregroundSamplingRateChangedReaction();
          backgroundSamplingRateChangedReaction();
        });

        if (this.configStore.config.passwordStoreEnabled) {
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
                  action(() => {
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
          l.error(
            "State store doesn't exist. A new one will be created after app close or refreshing",
            err
          );
          return this.loadRest().then(() => {
            Broker.emit(EventType.APP_READY);
          });
        }

        l.error(`Failed to load state store at ${stateStorePath}:`, err);
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
      .catch(l.error);
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

  constructor(initOnly: false) {
    this.save = this.save.bind(this);

    if (initOnly) return;

    if (global.IS_FEATHERS_READY) {
      this.load();
    } else {
      Broker.on(EventType.FEATHER_CLIENT_LOADED, value => {
        if (value) {
          global.IS_FEATHERS_READY = true;
          this.load();
        }
      });
    }

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
