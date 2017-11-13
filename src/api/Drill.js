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
  getDrillCompatibleAlias(alias) {
    return alias.replace(/\.|:/g, '-').replace(/\s/g, '');
  }
  @action.bound
  checkForExistingDrillProfile = (options = {}) => {
    // Options will contain options.db
    const profile = this.store.profileList.selectedProfile;
    const profileAlias = this.getDrillCompatibleAlias(profile.alias);
    const profileDB = options.db ? options.db : 'admin';
    if (
      this.profileDBHash[profileAlias] &&
      this.profileDBHash[profileAlias][profileDB]
    ) {
      return this.profileDBHash[profileAlias][profileDB];
    }
    return null;
  };

  @action.bound
  addNewEditorForDrill = (options = {}) => {
    // should have options.db equals to selectedTreeNode.text
    // options.type = EditorTypes.DRILL;
    const query = {};
    const profile = this.store.profileList.selectedProfile;
    query.alias = this.getDrillCompatibleAlias(profile.alias);
    query.id = profile.id;
    if (options.pass) {
      query.url = StaticApi.mongoProtocol +
        profile.username +
        ':' +
        options.pass +
        '@' +
        profile.host +
        ':' +
        profile.port +
        '/';
    } else {
      query.url = StaticApi.mongoProtocol +
        profile.host +
        ':' +
        profile.port +
        '/';
    }
    query.db = options.db ? options.db : 'admin';

    const service = featherClient().service('/drill');
    service.timeout = 90000;
    return service
      .create(query)
      .then((res) => {
        this.onDrillConnectionSuccess(res, query, profile, options);
      })
      .catch((err) => {
        console.error(err);
        this.onFailCreate(options);
      });
  };

  onDrillConnectionSuccess(res, query, profile, options) {
    console.log('Drill service result:', res);
    this.profileDBHash[query.alias] = {};
    this.profileDBHash[query.alias][query.db] = {
      id: res.id,
      output: res.output,
      profile,
    };
    this.openEditorWithDrillProfileId(
      this.profileDBHash[query.alias][query.db],
    );
    if (options.cbFunc) {
      options.cbFunc('success');
    }
  }

  onFailCreate(options) {
    console.log('failed to launch or connect to drill');
    if (options.cbFunc) {
      options.cbFunc('error');
    }
  }

  @action.bound
  openEditorWithDrillProfileId = (drillJdbcConnection) => {
    console.log(drillJdbcConnection.id, drillJdbcConnection.profile);
    this.api.addDrillEditor(drillJdbcConnection.profile, {
      shellId: drillJdbcConnection.id,
      type: EditorTypes.DRILL,
      output: drillJdbcConnection.output,
    });
  };

  @action.bound
  deleteProfileFromDrill = (options = {}) => {
    const query = {};
    const profile = (options.profile) ? options.profile : this.store.profileList.selectedProfile;
    query.alias = this.getDrillCompatibleAlias(profile.alias);
    query.id = profile.id;
    if (options.removeAll) {
      query.removeAll = true;
    }
    if (this.profileDBHash[query.alias] || query.removeAll) {
      const service = featherClient().service('/drill');
      service.timeout = 90000;
      return service
        .remove(query)
        .then((res) => {
          this.onDrillConnectionDeleteSuccess(res, query);
        })
        .catch((err) => {
          this.onFailDelete(err);
        });
    }
  };

  onDrillConnectionDeleteSuccess(res, query) {
    console.log('Drill delete service result:', res);
    if (res && query.removeAll) {
      this.profileDBHash = {};
    } else {
      delete this.profileDBHash[query.alias];
    }
  }

  onFailDelete(options) {
    console.log('failed to launch or connect to drill: ', options);
  }
}
