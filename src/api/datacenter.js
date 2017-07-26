/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-25T09:46:42+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-26T13:37:34+10:00
 */


import OutputApi from './Output';

export default class DataCenter {
  store;
  outputApi;

  constructor(store) {
    this.store = store;
    this.outputApi = new OutputApi(store);
    this.init = this.init.bind(this);

    this.addOutput = this.outputApi.addOutput.bind(this);
  }

  init() {
    this.outputApi.init();
  }
}
