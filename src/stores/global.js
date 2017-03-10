/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-08T19:18:30+11:00
 */

import { observable, computed } from 'mobx';
import TempTopology from './TempTopology.js';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable activeEditorId = 0;
  @observable activeDropdownId = 'Default';
  @observable executingEditorAll = false;
  @observable layout = {
    drawerOpen: false,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%',
  };
  @observable output = '// Output goes here!';

  @computed get topology() { // eslint-disable-line
    // this.getTopologyFromProfile()

    return TempTopology.data;
  }
}
