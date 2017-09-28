import { action } from 'mobx';
import { featherClient } from '~/helpers/feathers';
import { EditorTypes } from '#/common/Constants';
import StaticApi from './static';

export default class DrillApi {
  store;
  api;
  profileDBHash = {}; // this will store the JDBC connection id with respect to profile+DB

  constructor(store, api) {
    this.store = store;
    this.api = api;
  }
  @action.bound
  checkForExistingDrillProfile = (options = {}) => {
    const profile = this.store.profileList.selectedProfile;
    let profDB = profile.alias.replace(/:/g, '-').replace(/\s/g, '');
    profDB += '|';
    profDB += options.db ? options.db : 'admin';
    return this.profileDBHash[profDB];
  };
  @action.bound
  addNewEditorForDrill = (options = {}) => {
    // should have options.db equals to selectedTreeNode.text
    // options.type = EditorTypes.DRILL;
    const query = {};
    const profile = this.store.profileList.selectedProfile;
    query.alias = profile.alias.replace(/:/g, '-').replace(/\s/g, '');
    if (options.pass) {
      query.url =
        StaticApi.mongoProtocol +
        profile.username +
        ':' +
        options.pass +
        '@' +
        profile.host +
        ':' +
        profile.port +
        '/';
    } else {
      query.url =
        StaticApi.mongoProtocol + profile.host + ':' + profile.port + '/';
    }
    query.db = options.db ? options.db : 'admin';

    const profDB = query.alias + '|' + query.db;
    if (this.profileDBHash[profDB]) {
      console.log('editor jdbc id:', this.profileDBHash[profDB].id);
      openEditorWithDrillProfileId(this.profileDBHash[profDB]);
    } else {
      this.createDrillConnection(query, profile);
    }
  };

  @action.bound openEditorWithDrillProfileId = (drillJdbcConnection) => {
    console.log(drillJdbcConnection.id, drillJdbcConnection.profile);
    this.api.addDrillEditor(drillJdbcConnection.profile, {shellId: drillJdbcConnection.id, type: EditorTypes.DRILL});
  };

  createDrillConnection(query, profile) {
    const service = featherClient().service('/drill');
    service.timeout = 60000;
    return service
      .create(query)
      .then((res) => {
        this.onDrillConnectionSuccess(res, query, profile);
      })
      .catch((err) => {
        console.error(err);
        this.onFail();
      });
  }

  onDrillConnectionSuccess(res, query, profile) {
    console.log('Drill service result:', res);
    const profDB = query.alias + '|' + query.db;
    this.profileDBHash[profDB] = {id: res.id, profile};
    this.openEditorWithDrillProfileId(this.profileDBHash[profDB]);
  }
  onFail() {
    console.log('failed to launch or connect to drill');
  }
}
