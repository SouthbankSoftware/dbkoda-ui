/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-03-27T10:39:44+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-25T11:03:22+10:00
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
// import { NavPanes } from '#/common/Constants';
// import { performancePanelStatuses } from '~/api/PerformancePanel';

export default class TopConnections {
  store: *;
  api: *;

  constructor(store: *, api: *) {
    this.store = store;
    this.api = api;

    Broker.on(EventType.TOP_CONNECTIONS_DATA, ({ profileId, payload }) => {
      this.api.sendMsgToPerformanceWindow({
        profileId,
        command: 'mw_topConnectionsData',
        payload
      });
    });

    Broker.on(EventType.TOP_CONNECTIONS_ERROR, ({ profileId, payload: { error, level } }) => {
      this._handleError(profileId, error, level);
    });
  }

  _handleError = (profileId: UUID, err: Error | string, level: 'error' | 'warn' = 'error') => {
    const { alias } = this.store.profileStore.profiles.get(profileId);

    l.error(err);
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
    // this.api.transformPerformancePanel(profileId, performancePanelStatuses.external, {
    //   open: NavPanes.TOP_CONNECTIONS
    // });
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

  killOperation = (profileId: UUID, opId: *) => {
    const nOP = parseInt(opId, 10);
    let op = opId;
    if (!isNaN(nOP)) {
      op = nOP;
    }
    featherClient()
      .service('drivercommands')
      .patch(profileId, {
        database: 'admin',
        command: {
          killOp: 1,
          op
        }
      })
      .then(res => {
        l.info(res);
      })
      .catch(err => {
        this._handleError(profileId, err);
      });
  };
}
