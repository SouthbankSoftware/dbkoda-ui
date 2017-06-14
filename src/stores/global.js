/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-09T10:17:56+10:00
 */

import _ from 'lodash';
import { action, observable } from 'mobx';
import { dump, restore } from 'dumpenvy';
import { DrawerPanes } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
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

export default class Store {
  @observable locale = 'en';
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable outputs = observable.map();

  @observable userPreferences = observable({
    telemetryEnabled: false,
    showWelcomePageAtStart: true
  });

  @observable welcomePage = observable({
    isOpen: true,
    newsFeed: [],
    currentContent: 'Welcome' // Can be 'Welcome', 'Choose Theme' or 'Keyboard Shortcuts'
  });

  @observable editorPanel = observable({
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
    tabFilter: ''
  });

  @observable editorToolbar = observable({
    newConnectionLoading: false,
    currentProfile: 0,
    noActiveProfile: true,
    isActiveExecuting: false,
    id: 0,
    shellId: 0,
    newEditorForTreeAction: false,
    newEditorForProfileId: ''
  });

  @observable outputPanel = observable({
    currentTab: 'Default',
    clearingOutput: false,
    executingShowMore: false,
    executingTerminalCmd: false,
    sendingCommand: ''
  });

  @observable layout = {
    alertIsLoading: false,
    optInVisible: true,
    overallSplitPos: '40%',
    leftSplitPos: '50%',
    rightSplitPos: '50%'
  };

  @observable drawer = {
    drawerChild: DrawerPanes.DEFAULT
  };

  @observable treeActionPanel = {
    treeNode: null,
    treeAction: null,
    treeActionEditorId: '',
    newEditorCreated: false,
    formValues: '',
    isNewFormValues: false,
    editors: observable.map()
  };

  @observable detailsPanel = {
    detailsViewInfo: null,
    activeEditorId: ''
  };

  @observable treePanel = {
    isRefreshing: false,
    isRefreshDisabled: false
  };

  @observable explainPanel = {
    activeId: undefined,
    explainAvailable: false
  };

  @observable mongoShellPrompt = {
    prompt: 'dbcoda>'
  };

  @observable profileList = observable({
    selectedProfile: null,
    creatingNewProfile: false
  });

  @observable dragItem = observable({
    dragDrop: false,
    dragDropTerminal: false,
    item: null
  });

  @observable topology = observable({ isChanged: false, json: {}, profileId: '' });

  @action setDrawerChild = (value) => {
    this.drawer.drawerChild = value;
  };

  @action showConnectionPane = () => {
    this.setDrawerChild(DrawerPanes.PROFILE);
  };

  @action showTreeActionPane = () => {
    this.setDrawerChild(DrawerPanes.DYNAMIC);
  };

  @action setTreeAction = (treeNode, treeAction) => {
    this.treeActionPanel.treeNode = treeNode;
    this.treeActionPanel.treeAction = treeAction;
  }
  @action addNewEditorForTreeAction = () => {
    this.editorToolbar.newEditorForTreeAction = true;
    this.treeActionPanel.newEditorCreated = false;
  };

  @action updateDynamicFormCode = (value) => {
    this.treeActionPanel.formValues = value;
    this.treeActionPanel.isNewFormValues = true;
  };

  @action updateTopology = (res) => {
    this.topology.profileId = res.profileId;
    this.topology.json = res.result;
    this.topology.isChanged = true;
  };

  @action addEditor = (withProfile, newRes) => {
    this.editorPanel.creatingNewEditor = true;
    this.editorPanel.creatingWithProfile = withProfile;
    this.editorPanel.res = newRes;
  };

  @action dump() {
    return dump(this);
  }

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

  @action restore(data) {
    const newStore = restore(data);
    this.cleanStore(newStore);
    console.log('Restoring Store: ', newStore);
    _.assign(this, newStore);
  }

  cleanStore(newStore) {
    if (!newStore.locale) {
      newStore.locale = 'en';
    }
    Globalize.locale(newStore.locale);

    // EditorPanel:
    newStore.editorPanel.activeDropdownId = 'Default';
    newStore.editorPanel.activeEditorId = 'Default';
    newStore.editorPanel.creatingNewEditor = false;
    newStore.editorPanel.executingEditorAll = false;
    newStore.editorPanel.executingEditorLines = false;
    newStore.editorPanel.stoppingExecution = false;
    newStore.editorPanel.tabFilter = '';

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
    newStore.treePanel.isRefreshDisabled = false;
  }

  load() {
    featherClient()
      .service('files')
      .get(stateStore)
      .then(({ content }) => {
        this.restore(content);
        // Init Globalize required json
        Globalize.load(
          require('cldr-data/main/en/ca-gregorian.json'),
          require('cldr-data/supplemental/likelySubtags.json')
        );
      })
      .catch((err) => {
        if (err.code === 404) {
          console.log('State store doesn\'t exist. A new one will be created after app close or refreshing');
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

  save() {
    this.closeConnection().then(() => {
      featherClient()
        .service('files')
        .create({
          _id: stateStore,
          content: this.dump()
        })
        .then(() => {})
        .catch((err) => {
          console.log(err);
        });
    });
  }

  constructor() {
    Broker.on(EventType.FEATHER_CLIENT_LOADED, (value) => {
      if (value) {
        this.load();
      }
    });
  }
}
