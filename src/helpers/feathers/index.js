import load from 'little-loader';
import feathers from 'feathers-client';
import _ from 'lodash';
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
    const that = this;
    this.shellService.on('shell-output', (output) => {
      const {id, shellId} = output;
      const listeners = that.getShellOutputListeners(parseInt(id, 10), parseInt(shellId, 10));
      for (const ls of listeners) {
        for (const l of ls.listeners) {
          l(output);
        }
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
    const output = this.getShellOutputListeners(connectionId, shellId);
    if (output.length === 0) {
      this.outputListeners.push({connectionId, shellId, listeners: [listener]});
    } else {
      output[0].listeners.push(listener);
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
    const output = this.getShellOutputListeners(connectionId, shellId);
    if (output.length > 0) {
      const idx = output[0].listeners.indexOf(listener);
      if (idx >= 0) {
        output[0].listeners.splice(idx, 1);
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
  instance.configurePrimus(new Primus(url));
  return instance;
};

// let times = 0;
// const loadPrimus = () => {
//   load(url + '/dist/primus.js', (err) => {
//     if (!err) {
//       const primus = new Primus(url);
//       featherClient().configurePrimus(primus);
//     } else {
//       times += 1;
//       if (times < 3) {
//         setTimeout(() => {
//           loadPrimus();
//         }, 3000);
//       }
//     }
//   });
// };
// if (process.env.NODE_ENV !== 'test') {
//   loadPrimus();
// } else {
//
// }
