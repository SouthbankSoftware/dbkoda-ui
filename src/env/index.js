const protocol = 'http://';
const host = 'localhost';
const port = 3030;
const url = protocol + host + ':' + port;
if (process.env.NODE_ENV === 'production') {
  // TODO: define production configuration

}
module.exports = {
  protocol: 'http://',
  host: 'localhost',
  port: 3030,
  url
};
