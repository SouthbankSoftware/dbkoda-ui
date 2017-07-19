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
 */

import _ from 'lodash';
import { action, observable, when, runInAction } from 'mobx';
import { dump, restore } from 'dumpenvy';
import {
  serializer,
  deserializer,
  postDeserializer,
} from '#/common/mobxDumpenvyExtension';
import { DrawerPanes } from '#/common/Constants';
import uuidV1 from 'uuid';
import { Doc } from 'codemirror';
import { featherClient } from '~/helpers/feathers';
import { Intent } from '@blueprintjs/core';
import { NewToaster } from '#/common/Toaster';
import { Broker, EventType } from '../helpers/broker';
import { ProfileStatus } from '../components/common/Constants';

global.Globalize = require('globalize'); // Globalize doesn't load well with import

global.globalString = (path, ...params) =>
  Globalize.messageFormatter(path)(...params);
global.globalNumber = (value, config) =>
  Globalize.numberFormatter(config)(value);

let ipcRenderer;
let stateStore;

global.IS_ELECTRON = _.has(window, 'process.versions.electron');
if (IS_ELECTRON) {
  const electron = window.require('electron');

  ipcRenderer = electron.ipcRenderer;

  const remote = electron.remote;

  global.PATHS = remote.getGlobal('PATHS');
  stateStore = global.PATHS.stateStore;
}

global.EOL = global.IS_ELECTRON
  ? window.require('os').EOL
  : process.platform === 'win32' ? '\r\n' : '\n';

export default class Store {
  @observable locale = 'en';
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable outputs = observable.map();

  @observable
  userPreferences = observable({
    telemetryEnabled: null,
    showWelcomePageAtStart: true,
  });

  @observable
  welcomePage = observable({
    isOpen: true,
    newsFeed: [],
    currentContent: 'Welcome', // Can be 'Welcome', 'Choose Theme' or 'Keyboard Shortcuts'
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
    showingSavingDialog: false,
    lastFileSavingDirectoryPath: IS_ELECTRON ? global.PATHS.userHome : '',
    shouldScrollToActiveTab: false,
    tabScrollLeftPosition: 0,
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
  drawer = {
    drawerChild: DrawerPanes.DEFAULT,
  };

  @observable
  treeActionPanel = {
    treeNode: null,
    treeAction: null,
    treeActionEditorId: '',
    newEditorCreated: false,
    formValues: '',
    isNewFormValues: false,
    editors: observable.map(),
  };

  @observable
  detailsPanel = {
    lastTreeAction: null,
    lastTreeNode: null,
    detailsViewInfo: null,
    activeEditorId: '',
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
  showTreeActionPane = () => {
    this.setDrawerChild(DrawerPanes.DYNAMIC);
  };

  @action
  setTreeAction = (treeNode, treeAction) => {
    this.treeActionPanel.treeNode = treeNode;
    this.treeActionPanel.treeAction = treeAction;
  };

  @action
  addNewEditorForTreeAction = ({type = 'shell'}) => {
    this.editorToolbar.newEditorForTreeAction = true;
    this.editorToolbar.newEditorTypeForTreeAction = type;
    this.treeActionPanel.newEditorCreated = false;
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
  // Setting up editor after successful response from Controller, it's more than possible some of these
  // states could be removed or refactored eventually. Worth checking out when time allows.
  @action
  setNewEditorState = (res, options = {}) => {
    const { content = '' } = options;
    options = _.omit(options, ['content']);
    let fileName = `new${this.profiles.get(res.id).editorCount}.js`;
    if (options.type === 'aggregate') {
      fileName = 'Aggregate Builder';
    }

    const editorId = uuidV1();
    this.profiles.get(res.id).editorCount += 1;

    const doc = Store.createNewDocumentObject(content);
    doc.lineSep = Store.determineEol(content);

    this.editors.set(
      editorId,
      observable(
        _.assign(
          // NOTE this obj should be synced with the one in src/components/EditorPanel/Toolbar.jsx:profileCreated()
          {
            id: editorId,
            alias: this.profiles.get(res.id).alias,
            profileId: res.id,
            shellId: res.shellId,
            currentProfile: res.id,
            fileName,
            executing: false,
            visible: true,
            shellVersion: res.shellVersion,
            initialMsg: res.output ? res.output.join('\n') : '',
            doc: observable.ref(doc),
            status: ProfileStatus.OPEN,
            path: null,
            type: options.type
          },
          options,
        ),
      ),
    );
    this.editorPanel.creatingNewEditor = false;
    this.editorToolbar.noActiveProfile = false;
    this.editorToolbar.id = res.id;
    this.editorToolbar.shellId = res.shellId;
    this.editorToolbar.newConnectionLoading = false;
    this.editorPanel.shouldScrollToActiveTab = true;
    this.editorPanel.activeEditorId = editorId;
    this.editorToolbar.currentProfile = res.id;
    this.editorToolbar.noActiveProfile = false;
    this.editorPanel.activeDropdownId = res.id;
    this.newConnectionLoading = false;
    this.editorToolbar.isActiveExecuting = false;

    if (this.editorToolbar.newEditorForTreeAction) {
      this.editorToolbar.newEditorForTreeAction = false;
      this.treeActionPanel.treeActionEditorId = editorId;
      this.treeActionPanel.newEditorCreated = true;
      const treeEditor = this.editors.get(editorId);
      treeEditor.fileName = 'Tree Action';
      this.treeActionPanel.editors.set(editorId, treeEditor);
    }
    if (options.type === 'aggregate') {
      this.drawer.drawerChild = DrawerPanes.AGGREGATE;
    }

    NewToaster.show({
      message: globalString('editor/toolbar/connectionSuccess'),
      intent: Intent.SUCCESS,
      iconName: 'pt-icon-thumbs-up',
    });

    return editorId;
  };

  @action
  openNewAggregateBuilder(nodeRightClicked) {
    this.startCreatingNewEditor();
    // Create a new shell through feathers.
    return featherClient()
      .service('/mongo-shells')
      .create({ id: this.profiles.get(this.editorPanel.activeDropdownId).id })
      .then((res) => {
        // Create new editor as normal, but with "aggregate" type.
        return this.setNewEditorState(res, {type: 'aggregate', collection: nodeRightClicked});
      })
      .catch((err) => {
        this.createNewEditorFailed();
        console.error(err);
        NewToaster.show({
          message: 'Error: ' + err.message,
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down'
        });
      });
  }



  /**
   * Determine EOL to be used for given content string
   *
   * @param {string} content - content
   * @return {string} EOL
   */
  static determineEol(content) {
    if (!content || content === '') return global.EOL;

    const eols = content.match(/(?:\r?\n)/g) || [];

    if (eols.length === 0) return global.EOL;

    const crlfCount = eols.filter(eol => eol === '\r\n').length;
    const lfCount = eols.length - crlfCount;

    // majority wins and slightly favour \n
    return lfCount >= crlfCount ? '\n' : '\r\n';
  }

  static createNewDocumentObject(content = '') {
    return new Doc(content, 'MongoScript');
  }

  @action
  createNewEditorFailed = () => {
    this.editorPanel.creatingNewEditor = false;
    this.editorToolbar.newConnectionLoading = false;
  };

  @action
  dump() {
    return dump(this, { serializer });
  }

  openFile = (path, cb) => {
    return featherClient()
      .service('files')
      .get(path)
      .then(res => cb(res))
      .catch((err) => {
        NewToaster.show({
          message: err.message,
          intent: Intent.DANGER,
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

  closeConnection() {
    return new Promise((resolve) => {
      if (this.profiles && this.profiles.size > 0) {
        const promises = [];
        this.profiles.forEach((value) => {
          if (value.status === ProfileStatus.OPEN) {
            // close this connection from feather-client
            const service = featherClient().service('/mongo-connection');
            if (service) {
              promises.push(service.remove(value.id));
            }
          }
        });
        if (promises.length > 0) {
          Promise.all(promises).then(() => resolve()).catch(() => resolve());
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  @action
  restore(data) {
    const newStore = restore(data, { deserializer, postDeserializer });
    this.cleanStore(newStore);
    console.log('Restoring Store: ', newStore);
    _.assign(this, newStore);
  }

  cleanStore(newStore) {
    if (!newStore.locale) {
      newStore.locale = 'en';
    }
    Globalize.locale(newStore.locale);

    newStore.layout.alertIsLoading = false;
    // EditorPanel:
    newStore.editorPanel.activeDropdownId = 'Default';
    newStore.editorPanel.creatingNewEditor = false;
    newStore.editorPanel.executingEditorAll = false;
    newStore.editorPanel.executingEditorLines = false;
    newStore.editorPanel.stoppingExecution = false;
    newStore.editorPanel.tabFilter = '';
    newStore.editorPanel.showingSavingDialog = false;
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

    // Profiles:
    newStore.profiles.forEach((value) => {
      value.status = 'CLOSED';
    });

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

  /**
   * Load state store from user fs
   *
   * NOTE this should only be called once during current app lifetime
   */
  load() {
    featherClient()
      .service('files')
      .get(stateStore, {
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
        this.saveUponProfileChange();
      })
      .catch((err) => {
        if (err.code === 404) {
          console.log(
            "State store doesn't exist. A new one will be created after app close or refreshing",
          );
        } else {
          console.error(err);
        }
      })
      .then(() => {
        Broker.emit(EventType.APP_READY);
        if (IS_ELECTRON) {
          _.delay(() => {
            ipcRenderer.send(EventType.APP_READY);
          }, 200);
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
        _id: stateStore,
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
      fs.writeFileSync(stateStore, content);
    }
  }

  saveUponProfileChange() {
    this.profiles.observe(this.saveDebounced);
  }

  constructor() {
    this.save = this.save.bind(this);
    this.saveDebounced = _.debounce(this.save, 500);

    Broker.on(EventType.FEATHER_CLIENT_LOADED, (value) => {
      if (value) {
        this.load();
      }
    });
  }
}
