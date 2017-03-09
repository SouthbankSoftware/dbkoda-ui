import load from 'little-loader';
import _ from 'lodash';
import feathers from 'feathers-client';
import {url} from '../../env';


let instance = false;


/**
 * featherjs client wrapper. It wraps all featherjs client calls for each component.
 */
class FeatherClient {

  constructor() {
    this.feathers = feathers().configure(feathers.hooks());
    this.outputListeners = [];
  }

  configurePrimus(primus) {
    this.feathers = this.feathers.configure(feathers.primus(primus));
    this.shellService = this.feathers.service('/mongo-shells');
    this.shellService.on('shell-output', (output) => {
      console.log('get output', output);
      const {id, shellId} = output;
      const listeners = this.getShellOutputListeners(id, shellId);
      for (const listener of listeners) {
        listener(output);
      }
    });
  }

  service(service) {
    return this.feathers.service(service);
  }

  /**
   * add listener on the shell output via websocket
   *
   * @param connectionId  the mongodb connection id
   * @param shellId the shell connection id
   * @param listener  the listener who is listening on that connection
   */
  addOutputListener(connectionId, shellId, listener) {
    const listeners = this.getShellOutputListeners(connectionId, shellId);
    if (listeners.length === 0) {
      listeners.push({connectionId, shellId, listeners: [listener]});
    } else {
      listeners.listeners.push(listener);
    }
  }

  /**
   * remove output listener from featherjs client
   *
   * @param connectionId
   * @param shellId
   * @param listener
   */
  removeOutputListener(connectionId, shellId, listener) {
    const listeners = this.getShellOutputListeners(connectionId, shellId);
    if (listeners.length > 0) {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) {
        listeners.splice(idx, 1);
      }
    }
  }
  getShellOutputListeners(connectionId, shellId) {
    return _.filter(this.outputListeners, {connectionId, shellId});
  }

}

export const featherClient = () => {
  if (instance) return instance;
  instance = new FeatherClient();
  return instance;
};

let times = 0;
const loadPrimus = () => {
  load(url + '/dist/primus.js', (err) => {
    if (!err) {
      const primus = new Primus('http://localhost:3030');
      featherClient().configurePrimus(primus);
    } else {
      times += 1;
      if (times < 3) {
        setTimeout(() => {
          loadPrimus();
        }, 3000);
      }
    }
  });
};
if (process.env.NODE_ENV !== 'test') {
  loadPrimus();
}
