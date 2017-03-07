import {observable, action} from 'mobx';


export default class Store {

  @observable profiles = [];

  @action addProfile(profile) {
    this.profiles.push(profile);
  }

}
