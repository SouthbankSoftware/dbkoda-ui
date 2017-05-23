const protocol = 'http://';
const host = 'localhost';
const port = 3030;
const url = protocol + host + ':' + port;
if (process.env.NODE_ENV === 'production') {
  // TODO: define production configuration

}
module.exports = {
  protocol,
  host,
  port,
  url,
  storeFile: '/tmp/stateStore.json'
};
