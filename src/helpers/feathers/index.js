/**
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-27T11:05:05+11:00
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

import load from 'little-loader';
import feathers from 'feathers-client';
import { url } from '../../env';
import { Broker, EventType } from '../broker';

let instance = false;

/**
 * featherjs client wrapper. It wraps all featherjs client calls for each component.
 */
class FeatherClient {
  constructor() {
    this.feathers = feathers().configure(feathers.hooks());
  }

  configurePrimus(primus) {
    this.primus = primus;
    this.feathers = this.feathers.configure(feathers.primus(primus));
    this.shellService = this.feathers.service('/mongo-shells');
    this.osService = this.feathers.service('/os-execution');
    this.performanceSrv = this.feathers.service('/performance');

    // @Mike TODO - Move these service assignments so that the broker events are triggered every time. Maybe we can listen on the events rather than the service calls for telemetry.
    this.shellService.on('shell-output', output => {
      const { id, shellId } = output;
      Broker.emit(EventType.createShellOutputEvent(id, shellId), output);
      Broker.emit(EventType.SHELL_OUTPUT_AVAILABLE, output);
    });
    this.shellService.on('mongo-execution-end', output => {
      const { id, shellId } = output;
      Broker.emit(EventType.createShellExecutionFinishEvent(id, shellId), output);
    });
    this.shellService.on('mongo-shell-reconnected', output => {
      const { id, shellId } = output;
      Broker.emit(EventType.createShellReconnectEvent(id, shellId), output);
    });
    this.osService.on('os-command-output', output => {
      const { id, shellId } = output;
      Broker.emit(EventType.createShellOutputEvent(id, shellId), output);
    });
    this.osService.on('os-command-finish', output => {
      const { id, shellId } = output;
      Broker.emit(EventType.createShellOutputEvent(id, shellId), output);
      Broker.emit(EventType.createShellExecutionFinishEvent(id, shellId), output);
    });

    this.service('files').on('changed', ({ _id }) => {
      Broker.emit(EventType.createFileChangedEvent(_id));
    });

    this.service('aggregators').on('result', ({ editorId, result }) => {
      Broker.emit(EventType.createAggregatorResultReceived(editorId), result);
    });

    this.terminalService = this.service('terminals');
    this.terminalService.on('data', ({ _id, payload }) => {
      Broker.emit(EventType.TERMINAL_DATA(_id), payload);
    });
    this.terminalService.on('error', ({ _id, payload }) => {
      Broker.emit(EventType.TERMINAL_ERROR(_id), payload);
    });

    this.statsService = this.service('stats');
    this.statsService.on('data', ({ profileId, payload }) => {
      Broker.emit(EventType.STATS_DATA(profileId), payload);
    });
    this.statsService.on('error', ({ profileId, payload }) => {
      Broker.emit(EventType.STATS_ERROR(profileId), payload);
    });

    this.passwordService = this.service('master-pass');
    this.passwordService.on(EventType.MASTER_PASSWORD_REQUIRED, ({ method }) => {
      Broker.emit(EventType.MASTER_PASSWORD_REQUIRED, method);
    });
    this.passwordService.on(EventType.PASSWORD_STORE_RESET, () => {
      Broker.emit(EventType.PASSWORD_STORE_RESET, {});
    });

    this.performanceSrv.on('performance-output', ({ output }) => {
      console.log('get performance output ', output);
    });

    this.loggerService = this.service('logger');
    this.configService = this.service('config');

    // Top connections event handling.
    this.topConnectionsService = this.service('top-connections');
    this.topConnectionsService.on('data', data => {
      Broker.emit(EventType.TOP_CONNECTIONS_DATA, data);
    });
    this.topConnectionsService.on('error', data => {
      Broker.emit(EventType.TOP_CONNECTIONS_ERROR, data);
    });

    // Profiling event handling.
    this.profilingService = this.service('profile');
    this.profilingService.on('data', data => {
      console.log('Recieved Data from Profile Service: ', data);
      Broker.emit(EventType.PROFILING_DATA, data);
    });
    this.profilingService.on('error', data => {
      Broker.emit(EventType.PROFILING_ERROR, data);
    });
  }

  service(service) {
    if (!this.primus) {
      return null;
    }
    Broker.emit(EventType.CONTROLLER_ACTIVITY, service);
    return this.feathers.service(service);
  }

  closeConnection() {
    this.feathers.primus.end();
  }
}

export const featherClient = () => {
  if (instance) return instance;
  instance = new FeatherClient();
  // instance.configurePrimus(new Primus(url));
  return instance;
};

let times = 0;
const loadPrimus = () => {
  load(url + '/dist/primus.js', err => {
    l.info('load primus ', err, url);
    if (!err) {
      const primus = new window.Primus(url, {
        strategy: ['online', 'timeout', 'disconnect']
      });
      // remove native online/offline event so that when disconnected, ui is still connected to
      // controller. we may need to rethink this after we build our cloud solution
      if (window.addEventListener) {
        window.removeEventListener('offline', primus.offlineHandler);
        window.removeEventListener('online', primus.onlineHandler);
      } else if (document.body.attachEvent) {
        document.body.detachEvent('onoffline', primus.offlineHandler);
        document.body.detachEvent('ononline', primus.onlineHandler);
      }
      featherClient().configurePrimus(primus);
      Broker.emit(EventType.FEATHER_CLIENT_LOADED, true);
    } else {
      times += 1;
      if (times < 3) {
        setTimeout(() => {
          loadPrimus();
        }, 3000);
      } else {
        Broker.emit(EventType.FEATHER_CLIENT_LOADED, false);
      }
    }
  });
};
if (process.env.NODE_ENV !== 'test') {
  loadPrimus();
}
