/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-19T10:30:04+10:00
 */

import _ from 'lodash';
import { observable, action } from 'mobx';
import { dump, restore } from 'dumpenvy';
import { DrawerPanes } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
import path from 'path';

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
    tabFilter: ''
  });

  @observable editorToolbar = observable({
    newConnectionLoading: false,
    currentProfile: 0,
    noActiveProfile: true,
    isActiveExecuting: false,
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
    drawerOpen: false,
    width: '30%',
    drawerChild: null
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

  @action showConnectionPane = () => {
    this.drawer.drawerChild = DrawerPanes.PROFILE;
    this.drawer.drawerOpen = true;
  };
  @action showTreeActionPane = (treeNode, treeAction) => {
    this.treeActionPanel.treeNode = treeNode;
    this.treeActionPanel.treeAction = treeAction;
    this.drawer.drawerChild = DrawerPanes.DYNAMIC;
    this.drawer.drawerOpen = true;
    this.editorToolbar.newEditorForTreeAction = true;
  };

  @action updateDynamicFormCode = (value) => {
    this.treeActionPanel.formValues = value;
    this.treeActionPanel.isNewFormValues = true;
  };

  @action updateTopology = (jsonData) => {
    this.topology.json = jsonData;
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

  @action restore(data) {
    const newStore = restore(data);
    _.assign(this, newStore);
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
    this.load();
  }
}
