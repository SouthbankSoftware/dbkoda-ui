/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Run some mongo commands in the shell returning a promise that resolves to the shell output
 *
 */
// TODO: Should be integrated with mlaunch - assumes there is a mongod available

const spawn = require('child_process').spawn;

const debug = false;

module.exports = {
  mongoOutput: cmds => {
    return mongoPortOutputI(27017, cmds);
  },
  mongoPortOutput: (port, cmds) => {
    return mongoPortOutputI(port, cmds);
  }
};

function mongoPortOutputI(port, cmds) {
  const moutput = new Promise(resolve => {
    const mongoArgs = ['--port', port, '--shell'];
    const mongo = spawn('mongo', mongoArgs);
    mongo.stdin.write(cmds);
    mongo.stdin.write('\nexit;\n');
    let output = '';
    mongo.stderr.on('data', data => {
      if (debug) l.info(`stderr: ${data}`);
    });
    mongo.stdout.on('data', stdOut => {
      output += stdOut;
    });
    mongo.on('exit', () => {
      resolve(output);
    });
  });
  return moutput;
}
