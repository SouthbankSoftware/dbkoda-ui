/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-07T12:34:00+10:00
 */

import _ from 'lodash';
import { observable, action } from 'mobx';
import { dump, restore } from 'dumpenvy';
import { DrawerPanes } from '#/common/Constants';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable outputs = observable.map();

  @observable userPreferences = observable({
    telemetryEnabled: false,
  });

  @observable editorPanel = observable({
    creatingNewEditor: false,
    res: null,
    activeEditorId: 'Default',
    activeDropdownId: 'Default',
    executingEditorAll: false,
    executingEditorLines: false,
    executingExplain: undefined,
    tabFilter: '',
  });

  @observable editorToolbar = observable({
    newConnectionLoading: false,
    currentProfile: 0,
    noActiveProfile: true,
    isActiveExecuting: false,
    id: 0,
    shellId: 0,
  });

  @observable outputPanel = observable({
    currentTab: 'Default',
    clearingOutput: false,
    executingShowMore: false,
    executingTerminalCmd: false,
  });

  @observable layout = {
    optInVisible: true,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%',
  };

  @observable drawer = {
    drawerOpen: false,
    width: '30%',
    drawerChild: null,
    treeNode: null,
    treeAction: null
  };

  @action showConnectionPane = () => {
    this.drawer.drawerChild = DrawerPanes.PROFILE;
    this.drawer.drawerOpen = true;
  }
  @action showTreeActionPane = (treeNode, treeAction) => {
    this.drawer.treeNode = treeNode;
    this.drawer.treeAction = treeAction;
    this.drawer.drawerChild = DrawerPanes.DYNAMIC;
    this.drawer.drawerOpen = true;
  };

  @observable profileList = observable({
    selectedProfile: null,
    creatingNewProfile: false,
  });

  @observable dragItem = observable({
    dragDrop: false,
    item: null,
  });

  @observable topology = observable({
    isChanged: false,
    json: {},
  });

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
}
