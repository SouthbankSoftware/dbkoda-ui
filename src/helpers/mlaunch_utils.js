/**
 * @Author: guiguan
 * @Date:   2017-03-31T09:12:27+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-18T11:23:34+10:00
 */

const shelljs = require('shelljs');

const MLAUNCH = 'mlaunch';
const TMP_DIR = 'data';

/**
 * generate random port number between 6000 and 7000
 * @returns {number}
 */
const getRandomPort = () => {
  return Math.floor(Math.random() * 7000) + 6000;
};

/**
 * launch mongodb instance
 *
 * @param  type [description]
 */
const launchMongoInstance = (type, port, parameters) => {
  const command = MLAUNCH +
    ' init ' +
    type +
    ' --dir ' +
    TMP_DIR +
    '/' +
    port +
    ' --port ' +
    port +
    ' ' +
    parameters;
  console.log('launch command ', command);
  shelljs.exec(command);
};

/**
 * launch a single mongodb instance
 *
 */
const launchSingleInstance = (port, parameters = '') => {
  launchMongoInstance('--single', port, parameters);
};

/**
 * launch replica set
 *
 */
const launchReplicaSet = (port, nodenumber, parameters) => {
  console.log('launch replica set ', port);
  launchMongoInstance('--replicaset', port, '--nodes ' + nodenumber + ' ' + parameters);
};

/**
 * launch a mongos clusters
 * @param port
 * @param nodenumber
 * @param parameters
 */
const launchMongos = (port, nodenumber, parameters) => {
  launchMongoInstance('--mongos ' + nodenumber, port, parameters);
};

/**
 * generate mongo dump data on the collection
 *
 * @param port
 * @param dbName
 * @param colName
 * @param parameters
 */
const generateMongoData = (port, dbName = 'test', colName = 'test', parameters = '') => {
  const command = 'mgenerate tests/integration/json_template.json --num 1 --port ' +
    port +
    ' --database ' +
    dbName +
    ' --collection ' +
    colName +
    ' ' +
    parameters;
  shelljs.exec(command);
};

/**
 * shutdown mongo instance based on port number
 *
 * @param port
 */
const killMongoInstance = (port) => {
  const command = MLAUNCH + ' kill --dir ' + TMP_DIR + '/' + port;
  shelljs.exec(command);
  shelljs.exec('rm -fr ' + TMP_DIR + '/' + port);
};

module.exports = {
  launchSingleInstance,
  killMongoInstance,
  launchMongoInstance,
  launchReplicaSet,
  launchMongos,
  getRandomPort,
  generateMongoData,
};
