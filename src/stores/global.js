/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-28T13:12:21+11:00
 */
import {observable, action} from 'mobx';
import TempTopology from './TempTopology.js';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable outputs = observable.map();

  @observable editorPanel = observable({
    creatingNewEditor: false,
    creatingWithProfile: false,
    res: null,
    activeEditorId: 'Default',
    activeDropdownId: 'Default',
    executingEditorAll: false,
    executingEditorLines: false,
    tabFilter: ''
  });

  @observable editorToolbar = observable({
      newConnectionLoading: false,
      currentProfile: 0,
      noActiveProfile: true,
      noExecutionRunning: true,
      id: 0,
      shellId: 0
  });

  @observable outputPanel = observable({
    currentTab: 'Default',
    executingShowMore: false,
    executingTerminalCmd: false
  });

  @observable layout = {
    drawerOpen: false,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%'
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
    isChanged: true,
    json: JSON.parse(TempTopology.data)
  });

  @action addEditor = (withProfile, newRes) => {
    this.editorPanel.creatingNewEditor = true;
    this.editorPanel.creatingWithProfile = withProfile;
    this.editorPanel.res = newRes;
  }
}
