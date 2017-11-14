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
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-09T11:29:07+11:00
 */

import _ from 'lodash';
import { action, observable, when, runInAction } from 'mobx';
import { dump, restore } from 'dumpenvy';
import {
  serializer,
  deserializer,
  postDeserializer,
} from '#/common/mobxDumpenvyExtension';
import { EditorTypes, DrawerPanes } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';
import moment from 'moment';
import { Broker, EventType } from '../helpers/broker';
import { ProfileStatus } from '../components/common/Constants';

global.Globalize = require('globalize'); // Globalize doesn't load well with import

global.globalString = (path, ...params) =>
  Globalize.messageFormatter(path)(...params);
global.globalNumber = (value, config) =>
  Globalize.numberFormatter(config)(value);

let ipcRenderer;
let stateStorePath;

global.IS_ELECTRON = _.has(window, 'process.versions.electron');
if (IS_ELECTRON) {
  const electron = window.require('electron');

  ipcRenderer = electron.ipcRenderer;

  const remote = electron.remote;

  global.PATHS = remote.getGlobal('PATHS');
  global.GetRandomPort = remote.getGlobal('getRandomPort');
  stateStorePath = global.PATHS.stateStore;
}

global.EOL = global.IS_ELECTRON
  ? window.require('os').EOL
  : process.platform === 'win32' ? '\r\n' : '\n';

export default class Store {
  api;
  profileStore;
  @observable locale = 'en';
  @observable version = '0.9.0-beta.1';
  @observable updateAvailable = false;
  // @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable outputs = observable.map();
  @observable sshShells = observable.shallowMap();

  @observable
  userPreferences = observable({
    telemetryEnabled: true,
    showWelcomePageAtStart: true,
  });

  @observable
  welcomePage = observable({
    isOpen: true,
    newsFeed: [],
    currentContent: 'Welcome', // Can be 'Welcome', 'Choose Theme' or 'Keyboard Shortcuts'
  });

  @observable
  configPage = observable({
    isOpen: true,
    selectedMenu: 'Paths',
    changedFields: observable([]),
    newSettings: observable([]),
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
    updateAggregateCode: false,
  });

  @observable
  editorToolbar = observable({
    newConnectionLoading: false,
    currentProfile: 0,
    noActiveProfile: true,
    isActiveExecuting: false,
    id: 0,
    shellId: 0,
    newEditorForTreeAction: false,
    newEditorForProfileId: '',
    saveAs: false,
  });

  @observable
  outputPanel = observable({
    currentTab: 'Default',
    clearingOutput: false,
    executingShowMore: false,
    executingTerminalCmd: false,
    sendingCommand: '',
    collapseTable: false,
    expandTable: false,
  });

  @observable
  layout = {
    alertIsLoading: false,
    optInVisible: true,
    overallSplitPos: '35%',
    leftSplitPos: '50%',
    rightSplitPos: '60%',
  };

  @observable
  drawer = observable({
    drawerChild: DrawerPanes.DEFAULT,
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
    refreshOnExecution: false,
  };

  @observable
  detailsPanel = {
    lastTreeAction: null,
    lastTreeNode: null,
    detailsViewInfo: null,
    activeEditorId: '',
  };

  @observable
  storagePanel = {
    selectedDatabase: null,
  };

  @observable
  treePanel = {
    isRefreshing: false,
    isRefreshDisabled: true,
  };

  @observable
  explainPanel = {
    activeId: undefined,
    explainAvailable: false,
  };

  @observable
  mongoShellPrompt = {
    prompt: 'dbkoda>',
  };

  @observable
  profileList = observable({
    selectedProfile: null,
    creatingNewProfile: false,
  });

  @observable
  dragItem = observable({
    dragDrop: false,
    dragDropTerminal: false,
    item: null,
  });

  @observable
  topology = observable({ isChanged: false, json: {}, profileId: '' });

  @action
  setDrawerChild = (value) => {
    this.drawer.drawerChild = value;
  };

  @action
  showConnectionPane = () => {
    this.setDrawerChild(DrawerPanes.PROFILE);
  };

  @action
  showTreeActionPane = (type) => {
    if (type == EditorTypes.TREE_ACTION) {
      this.setDrawerChild(DrawerPanes.DYNAMIC);
    } else if (type == EditorTypes.SHELL_COMMAND) {
      this.setDrawerChild(DrawerPanes.BACKUP_RESTORE);
    }
  };

  @action
  setTreeAction = (treeNode, treeAction) => {
    this.treeActionPanel.treeNode = treeNode;
    this.treeActionPanel.treeAction = treeAction;
  };

  @action
  updateDynamicFormCode = (value) => {
    this.treeActionPanel.formValues = value;
    this.treeActionPanel.isNewFormValues = true;
  };

  @action
  updateTopology = (res) => {
    this.topology.profileId = res.profileId;
    this.topology.json = res.result;
    this.topology.isChanged = true;
  };

  @action
  addEditor = (withProfile, newRes) => {
    this.editorPanel.creatingNewEditor = true;
    this.editorPanel.creatingWithProfile = withProfile;
    this.editorPanel.res = newRes;
  };

  // Actions for creating new editors, currently used by ProfileListPanel/ListView.jsx
  // When time allows editor/Toolbar.jsx should also be refactored to use these same actions.
  @action
  startCreatingNewEditor = () => {
    this.editorPanel.creatingNewEditor = true;
    this.editorToolbar.newConnectionLoading = true;
  };

  @action
  openNewAggregateBuilder(nodeRightClicked) {
    if (this.editorPanel.activeDropdownId === 'Default') {
      NewToaster.show({
        message:
          'Error: Please select an open connection from the Profile Dropdown.',
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
      });
    }
    this.startCreatingNewEditor();
    // Create a new shell through feathers.
    return featherClient()
      .service('/mongo-shells')
      .create({ id: this.profileStore.profiles.get(this.editorPanel.activeDropdownId).id })
      .then((res) => {
        // Create new editor as normal, but with "aggregate" type.
        return this.api.setNewEditorState(res, {
          type: 'aggregate',
          collection: {
            text: nodeRightClicked.text,
            refParent: { text: nodeRightClicked.refParent.text },
          },
          blockList: [],
        });
      })
      .catch((err) => {
        this.api.createNewEditorFailed();
        console.error(err);
        NewToaster.show({
          message: 'Error: ' + err.message,
          className: 'danger',
          iconName: 'pt-icon-thumbs-down',
        });
      });
  }

  @action
  dump() {
    // TODO: Remove this after the api has been implemented completely from here
    const dumpStore = {};
    _.assign(dumpStore, this);
    if (dumpStore.api) {
      delete dumpStore.api;
    }
    if (dumpStore.profileStore) {
      delete dumpStore.profileStore;
    }
    // Remove till here
    // return dump(this, { serializer });
    return dump(dumpStore, { serializer });
  }

  openFile = (path, cb) => {
    return featherClient()
      .service('files')
      .get(path)
      .then(res => cb(res))
      .catch((err) => {
        NewToaster.show({
          message: err.message,
          className: 'danger',
          iconName: 'pt-icon-thumbs-down',
        });
        throw err;
      });
  };

  watchFileBackgroundChange = (editorId) => {
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
        },
      );
    }
  };

  @action
  closeConnection() {
    return new Promise((resolve) => {
      if (this.profileStore && this.profileStore.profiles && this.profileStore.profiles.size > 0) {
        const promises = [];
        this.profileStore.profiles.forEach((value) => {
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
  @action
  updateAndRestart() {
    this.updateAvailable = false;
    ipcRenderer.send('updateAndRestart');
  }

  @action
  restore(data) {
    const newStore = restore(data, { deserializer, postDeserializer });
    this.cleanStore(newStore);
    _.assign(this, newStore);
  }

  cleanStore(newStore) {
    if (!newStore.locale) {
      newStore.locale = 'en';
    }
    Globalize.locale(newStore.locale);

    newStore.layout.alertIsLoading = false;

    // Version:
    newStore.version = '0.9.0-beta.1';

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
    newStore.editorToolbar.isActiveExecuting = false;
    newStore.editorToolbar.isExplainExecuting = false;
    newStore.editorToolbar.newConnectionLoading = false;
    newStore.editorToolbar.noActiveProfile = true;

    // Editors:
    newStore.editors.forEach((value) => {
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
        `stateStore.${dateStr}.json`,
      );
      return featherClient()
        .service('files')
        .get(stateStorePath, {
          query: {
            copyTo: backupPath,
            watching: 'false',
          },
        });
    }

    return Promise.reject(new Error('Backup only supported in Electron'));
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
          watching: 'false',
        },
      })
      .then(({ content }) => {
        this.restore(content);
        // Init Globalize required json
        Globalize.load(
          require('cldr-data/main/en/ca-gregorian.json'),
          require('cldr-data/supplemental/likelySubtags.json'),
        );
        this.saveUponEditorsChange();

        if (this.api) {
          this.api.init();
        }

        Broker.emit(EventType.APP_READY);
      })
      .catch((err) => {
        if (err.code === 404) {
          console.error(
            "State store doesn't exist. A new one will be created after app close or refreshing",
          );
          Broker.emit(EventType.APP_READY);
        } else {
          console.error(err);
          Broker.emit(EventType.APP_CRASHED);
        }
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
        watching: false,
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

  constructor() {
    this.save = this.save.bind(this);
    this.saveDebounced = _.debounce(this.save, 500);

    Broker.on(EventType.FEATHER_CLIENT_LOADED, (value) => {
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

  // Temporary setting reference to API in store because most of the action are still here in store.
  setAPI(apiRef) {
    this.api = apiRef;
  }
  setProfileStore(profileStore) {
    this.profileStore = profileStore;
  }
}
