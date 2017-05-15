/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-01T01:35:50+10:00
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
    this.shellService.on('shell-output', (output) => {
      const { id, shellId } = output;
      console.log('got output ', output);
      Broker.emit(EventType.createShellOutputEvent(id, shellId), output);
      Broker.emit(EventType.SHELL_OUTPUT_AVAILABLE, output);
    });
    this.shellService.on('mongo-execution-end', (output) => {
      const { id, shellId } = output;
      Broker.emit(EventType.createShellExecutionFinishEvent(id, shellId), output);
    });
    this.service('files').on('changed', ({_id}) => {
      Broker.emit(EventType.createFileChangedEvent(_id));
    });
  }

  service(service) {
    if (!this.primus) {
      return null;
    }
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
  load(url + '/dist/primus.js', (err) => {
    if (!err) {
      const primus = new Primus(url);
      featherClient().configurePrimus(primus);
      console.log('load primus successfully.');
      Broker.emit(EventType.FEATHER_CLIENT_LOADED, true);
    } else {
      times += 1;
      if (times < 3) {
        setTimeout(() => {
          loadPrimus();
        }, 3000);
      } else {
        console.log('load primus failed.');
        Broker.emit(EventType.FEATHER_CLIENT_LOADED, false);
      }
    }
  });
};
if (process.env.NODE_ENV !== 'test') {
  loadPrimus();
}
