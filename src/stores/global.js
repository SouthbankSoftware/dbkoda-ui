/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
* @Last modified by:   wahaj
* @Last modified time: 2017-03-14T16:18:55+11:00
 */

import { observable, action } from 'mobx';
import TempTopology from './TempTopology.js';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable activeEditorId = 0;
  @observable activeDropdownId = 'Default';
  @observable executingEditorAll = false;
  @observable executingEditorLines = false;
  @observable layout = {
    drawerOpen: false,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%',
  };
  @observable output = {
      output: '// Output goes here!',
      cannotShowMore: true,
  }

  @observable topology = JSON.parse(TempTopology.data);

  @action addTopology = (value) => {
    this.topology.push(value);
  }
}
