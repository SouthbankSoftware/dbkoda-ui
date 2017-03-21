/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   chris
 * @Last modified time: 2017-03-20T14:58:32+11:00
 */
import {observable, action} from 'mobx';
import TempTopology from './TempTopology.js';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable outputs = observable.map();

  @observable editorPanel = {
    activeEditorId: 0,
    activeDropdownId: 'Default',
    executingEditorAll: false,
    executingEditorLines: false,
    tabFilter: ''
  }

  @observable layout = {
    drawerOpen: false,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%'
  };

  @observable profileList = {
    creatingNewProfile: false
  };

  @observable dragItem = {
    dragDrop: false,
    item: null
  };

  @observable topology = JSON.parse(TempTopology.data);

  @action addTopology = (value) => {
    this
      .topology
      .push(value);
  }
}
