/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-08T17:12:40+11:00
 */
import {observable} from 'mobx';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable layout = {};
}
