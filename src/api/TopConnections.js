/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-03-27T10:39:44+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-27T11:33:32+11:00
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

export default class TopConnections {
  store: *;

  constructor(store: *) {
    this.store = store;

    Broker.on(EventType.TOP_CONNECTIONS_DATA, ({ profileId, payload }) => {
      const { alias } = this.store.profileStore.profiles.get(profileId);

      console.log(`%cTop connections for ${alias} (${profileId}):`, 'color: green');
      console.table(payload);
    });

    Broker.on(EventType.TOP_CONNECTIONS_ERROR, ({ profileId, payload: { error, level } }) => {
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

  getTopConnections = (
    profileId: UUID,
    n: number = 10,
    samplingTime: number = 5000,
    samplingRate: number = 100,
    dev: boolean = false
  ) => {
    featherClient()
      .service('top-connections')
      .get(profileId, {
        query: {
          n,
          samplingTime,
          samplingRate,
          dev
        }
      })
      .catch(err => {
        this._handleError(profileId, err);
      });
  };
}
