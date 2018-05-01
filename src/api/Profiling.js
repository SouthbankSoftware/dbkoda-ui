/**
 * @flow
 *
 * @Author: Michael <guiguan>
 * @Date:   2018-03-27T10:39:44+11:00
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2018-04-17T10:56:32+10:00
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

import { Broker, EventType } from '~/helpers/broker';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';

export default class Profiling {
  store: *;
  api: *;

  constructor(store: *, api: *) {
    this.store = store;
    this.api = api;

    Broker.on(EventType.PROFILING_DATABASES_DATA, ({ profileId, payload }) => {
      const { alias } = this.store.profileStore.profiles.get(profileId);

      console.log(`%cProfling Databases for ${alias} (${profileId}):`, 'color: green');
      console.log(payload);
      this.api.sendMsgToPerformanceWindow({
        profileId,
        command: 'mw_profilingDatabaseData',
        payload
      });
    });

    Broker.on(EventType.PROFILING_DATA, ({ profileId, payload }) => {
      const { alias } = this.store.profileStore.profiles.get(profileId);

      console.log(`%cProfling Data for ${alias} (${profileId}):`, 'color: green');
      console.log(payload);
      this.api.sendMsgToPerformanceWindow({
        profileId,
        command: 'mw_profilingData',
        payload
      });
    });

    Broker.on(EventType.PROFILING_ERROR, ({ profileId, payload: { error, level } }) => {
      this._handleError(profileId, error, level);
    });
  }

  _handleError = (profileId: UUID, err: Error | string, level: 'error' | 'warn' = 'error') => {
    const { alias } = this.store.profileStore.profiles.get(profileId);

    console.error(err);
    // $FlowFixMe
    const errorMessage = `Profile ${alias} (${profileId}) ${level}: ${err.message || err}`;

    NewToaster.show({
      message: errorMessage,
      className: level === 'error' ? 'danger' : 'warning',
      iconName: 'pt-icon-thumbs-down'
    });
  };

  getProfilingDataBases = (profileId: UUID) => {
    const service = featherClient().service('profile');
    service.timeout = 30000;
    service
      .get(profileId, {
        query: {
          op: 'configuration'
        }
      })
      .then(res => {
        Broker.emit(EventType.PROFILING_DATABASES_DATA, {
          profileId,
          payload: res
        });
      })
      .catch(err => {
        this._handleError(profileId, err);
      });
  };

  getProfilingData = (profileId: UUID, database: string) => {
    const service = featherClient().service('profile');
    service.timeout = 30000;
    service
      .get(profileId, {
        query: {
          op: 'profile',
          dbName: database
        }
      })
      .then(res => {
        console.log(res);
        Broker.emit(EventType.PROFILING_DATA, {
          profileId,
          payload: res
        });
      })
      .catch(err => {
        this._handleError(profileId, err);
      });
  };
}
