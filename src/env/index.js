/**
 * @Last modified by:   chris
 * @Last modified time: 2017-06-26T11:34:03+10:00
 */

const protocol = 'http://';
const host = 'localhost';
const port = 3030;
const url = protocol + host + ':' + port;
const analytics = {
  'development': 'UA-101162043-2',
  'prod': 'UA-101162043-1'
};

module.exports = {
  protocol,
  host,
  port,
  url,
  analytics
};
