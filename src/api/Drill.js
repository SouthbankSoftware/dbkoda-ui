/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-29T14:43:31+11:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

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
    if (this.profileDBHash[profileAlias] && this.profileDBHash[profileAlias][profileDB]) {
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
    if (profile.hostRadio) {
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
        query.url = StaticApi.mongoProtocol + profile.host + ':' + profile.port + '/';
      }
    } else if (profile.url.indexOf('@') < 0) {
        const mUrl = profile.url.replace(StaticApi.mongoProtocol, '');
        query.url = StaticApi.mongoProtocol + profile.username + ':' + options.pass + '@' + mUrl;
      } else {
        query.url = profile.url;
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
        this.onFailCreate(options, err.code);
      });
  };

  onDrillConnectionSuccess(res, query, profile, options) {
    console.log('Drill service result:', res);
    this.profileDBHash[query.alias] = {};
    this.profileDBHash[query.alias][query.db] = {
      id: res.id,
      output: res.output,
      profile,
      db: query.db,
    };
    this.openEditorWithDrillProfileId(this.profileDBHash[query.alias][query.db]);
    if (options.cbFunc) {
      options.cbFunc('success');
    }
  }

  onFailCreate(options, code) {
    console.log('failed to launch or connect to drill');
    if (options.cbFunc) {
      options.cbFunc('error', code);
    }
  }

  @action.bound
  openEditorWithDrillProfileId = (drillJdbcConnection) => {
    console.log(drillJdbcConnection.id, drillJdbcConnection.profile);
    this.api.addDrillEditor(drillJdbcConnection.profile, {
      shellId: drillJdbcConnection.id,
      type: EditorTypes.DRILL,
      output: drillJdbcConnection.output,
      db: drillJdbcConnection.db,
    });
  };

  @action.bound
  deleteProfileFromDrill = (options = {}) => {
    const query = {};
    const profile = options.profile ? options.profile : this.store.profileList.selectedProfile;
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
