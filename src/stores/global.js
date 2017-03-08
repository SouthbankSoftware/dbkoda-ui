/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
* @Last modified by:   wahaj
* @Last modified time: 2017-03-08T17:22:36+11:00
 */

import { observable, computed } from 'mobx';
import TempTopology from './TempTopology.js';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable layout = {};

  @computed get topology() {
    // this.getTopologyFromProfile()

    return TempTopology.data;
  }
}
