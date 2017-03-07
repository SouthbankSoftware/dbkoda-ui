import load from 'little-loader';
import feathers from 'feathers-client';

let instance = false;

export const featherClient = () => {
  if (instance) return instance;
  instance = feathers().configure(feathers.hooks());
  return instance;
};

export const featherService = (service) => {
  if (instance) {
    return instance.service(service);
  }
};

export const connectionService = () => {
  return featherService('mongo-connection');
};

let times = 0;


const loadPrimus = () => {
  load('http://localhost:3030/dist/primus.js', (err) => {
    if (!err) {
      const primus = new Primus('http://localhost:3030');
      featherClient().configure(feathers.primus(primus));
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
