/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   chris
 * @Last modified time: 2017-04-27T11:56:22+10:00
 */

import _ from 'lodash';
import { observable, action, runInAction } from 'mobx';
import { dump, restore } from 'dumpenvy';
import { DrawerPanes } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
import path from 'path';
import { Broker, EventType } from '../helpers/broker';

global.IS_ELECTRON = _.has(window, 'process.versions.electron');

let ipcRenderer;

if (IS_ELECTRON) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable outputs = observable.map();

  @observable userPreferences = observable({
    telemetryEnabled: false
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
    isExplainExecuting: false,
    id: 0,
    shellId: 0,
    newEditorForTreeAction: false
  });

  @observable outputPanel = observable({
    currentTab: 'Default',
    clearingOutput: false,
    executingShowMore: false,
    executingTerminalCmd: false
  });

  @observable layout = {
    optInVisible: true,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%'
  };

  @observable drawer = {
    drawerChild: DrawerPanes.DEFAULT
  };

  @observable treeActionPanel = {
    treeNode: null,
    treeAction: null,
    form: null,
    treeActionEditorId: '',
    formValues: '',
    isNewFormValues: false
  };

  @observable explainPanel = {
    activeId: undefined,
    explainAvailable: false
  };

  @observable mongoShellPrompt = {
    prompt: 'dbenvy>'
  };

  @observable profileList = observable({
    selectedProfile: null,
    creatingNewProfile: false
  });

  @observable dragItem = observable({
    dragDrop: false,
    item: null
  });

  @observable topology = observable({
    isChanged: false,
    json: {}
  });

  setDrawerChild = (value) => {
    runInAction('update left drawer', () => {
      this.drawer.drawerChild = value;
    });
  };

  @action showConnectionPane = () => {
    this.setDrawerChild(DrawerPanes.PROFILE);
  };
  @action showTreeActionPane = (treeNode, treeAction) => {
    this.treeActionPanel.treeNode = treeNode;
    this.treeActionPanel.treeAction = treeAction;
    this.setDrawerChild(DrawerPanes.DYNAMIC);
    this.editorToolbar.newEditorForTreeAction = true;
  };

  updateDynamicFormCode = (value) => {
    runInAction('update code in editor', () => {
      this.treeActionPanel.formValues = value;
      this.treeActionPanel.isNewFormValues = true;
    });
  };

  updateTopology = (jsonData) => {
    runInAction('updating topology', () => {
      this.topology.json = jsonData;
      this.topology.isChanged = true;
    });
  };

  @action addEditor = (withProfile, newRes) => {
    this.editorPanel.creatingNewEditor = true;
    this.editorPanel.creatingWithProfile = withProfile;
    this.editorPanel.res = newRes;
  };

  @action dump() {
    return dump(this);
  }

  @action restore(data) {
    const newStore = restore(data);
    this.cleanStore(newStore);
    console.log('Restoring Store: ', newStore);
    _.assign(this, newStore);
  }

  cleanStore(newStore) {
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
  }

  load() {
    featherClient()
      .service('files')
      .get(path.resolve('/tmp/stateStore.json'))
      .then(({ content }) => {
        this.restore(content);
      })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        if (IS_ELECTRON) {
          _.delay(
            () => {
              ipcRenderer.send('appReady');
            },
            200
          );
        }
      });
  }

  save() {
    featherClient()
      .service('files')
      .create({
        _id: path.resolve('/tmp/stateStore.json'),
        content: this.dump()
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
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
