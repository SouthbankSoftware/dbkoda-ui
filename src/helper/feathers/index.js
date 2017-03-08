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
    this.connectionService = this.feathers.service('/mongo-connection');
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
   * create mongodb connection
   *
   * @param url the mongodb url
   * @param test  whether this is test connection
   * @param ssl whether connect through ssl
   * @param authorization whether require authorization check after connection
   * @returns {Promise<any>}
   */
  createConnection(url, test = false, ssl = false, authorization = true) {
    return this.connectionService.create({}, {query: {url, test, ssl, authorization}});
  }

  /**
   * create a shell connection on the connection id;
   *
   * @param connectionId  the id of the mongodb connection
   * @returns {Promise<any>}
   */
  createShellConnection(connectionId) {
    return this.shellService.create({id: connectionId});
  }

  getShellOutputListeners(connectionId, shellId) {
    return _.filter(this.outputListeners, {connectionId, shellId});
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
   * execute command through shell connection
   * @returns {Promise<any>}
   */
  executeCommandThroughShell(connectionId, shellId, command) {
    return this.shellService.update(connectionId, {'shellId': shellId, 'commands': command});
  }

  /**
   * remove shell connection
   *
   */
  removeShellConnection(connectionId, shellId) {
    return this.shellService.remove(connectionId, {query: {shellId}});
  }

  /**
   * remove a mongodb connection. it will remove all shell connections.
   * @param connectionId
   */
  removeConnection(connectionId) {
    return this.connectionService.remove(connectionId);
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
