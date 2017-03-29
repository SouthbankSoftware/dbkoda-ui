/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-29T17:30:54+11:00
 */

import _ from 'lodash';
import { observable, action } from 'mobx';
import { dump, restore } from 'dumpenvy';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable outputs = observable.map();

  @observable userPreferences = observable({
    telemetryEnabled: false,
  });

  @observable editorPanel = observable({
    creatingNewEditor: false,
    creatingWithProfile: false,
    res: null,
    activeEditorId: 'Default',
    activeDropdownId: 'Default',
    executingEditorAll: false,
    executingEditorLines: false,
    tabFilter: '',
  });

  @observable editorToolbar = observable({
    newConnectionLoading: false,
    currentProfile: 0,
    noActiveProfile: true,
    noExecutionRunning: true,
    id: 0,
    shellId: 0,
  });

  @observable outputPanel = observable({
    currentTab: 'Default',
    executingShowMore: false,
    executingTerminalCmd: false,
  });

  @observable layout = {
    optInVisible: true,
    drawerOpen: false,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%',
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
