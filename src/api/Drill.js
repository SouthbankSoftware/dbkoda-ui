import { action } from 'mobx';
import { featherClient } from '~/helpers/feathers';
// import { EditorTypes } from '#/common/Constants';
import StaticApi from './static';

export default class DrillApi {
  store;
  api;
  profileDBHash = {};

  constructor(store, api) {
    this.store = store;
    this.api = api;
  }

  @action.bound
  addNewEditorForDrill = (options = {}) => {
    // should have options.db equals to selectedTreeNode.text
    // options.type = EditorTypes.DRILL;
    const query = {};
    const profile = this.store.profileList.selectedProfile;
    query.alias = profile.alias;
    query.url =
      StaticApi.mongoProtocol + profile.host + ':' + profile.port + '/';
    query.db = options.db ? options.db : 'admin';

    const profDB = query.alias + '|' + query.db;
    if (this.profileDBHash[profDB]) {
      console.log('editor connection id:', this.profileDBHash[profDB]);
    } else {
      this.createDrillConnection(query);
    }
  };

  createDrillConnection(query) {
    const service = featherClient().service('/drill');
    service.timeout = 30000;
    return service
      .create(query)
      .then((res) => {
        this.onDrillConnectionSuccess(res, query);
      })
      .catch((err) => {
        console.error(err);
        this.onFail();
      });
  }

  onDrillConnectionSuccess(res, data) {
    console.log('Drill service result:', res);
    console.log(data);
  }
  onFail() {
    console.log('failed to launch or connect to drill');
  }
}
