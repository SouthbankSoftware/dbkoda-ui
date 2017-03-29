import feathers from 'feathers-client';
import Primus from '@southbanksoftware/dbenvy-controller';
import {url} from '../../env';
import {Broker, EventType} from '../broker';

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
      console.log('get output ', output);
      const {id, shellId} = output;
      Broker.emit(EventType.createShellOutputEvent(id, shellId), output);
    });
    this.shellService.on('mongo-execution-end', (output)=>{
      console.log('mongo execution finished ', output);
      const {id, shellId} = output;
      Broker.emit(EventType.createShellExecutionFinishEvent(id, shellId));
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
  instance.configurePrimus(new Primus(url));
  return instance;
};
