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

/**
*  Unit Test for ALter user template

* @Author: Guy Harrison

*/
//
// Unit test for AlterUser template
//
// TODO: Fix dependency on local mongo (use mlaunch?)
/* eslint no-unused-vars:warn */
const debug = false;
const templateToBeTested =
  './src/components/TreeActionPanel/Templates/CreateCollection.hbs';
const templateInput = require('./CreateCollection.hbs.input.json');
const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');

hbs.registerHelper('json', jsonHelper);

// Random collection for the test
const randomCollectionName =
  'collection' + Math.floor(Math.random() * 10000000);

const myDatabase = templateInput.Database;
templateInput.CollectionName = randomCollectionName;

// Command to drop the collection
const setupCollectionCommands = [];
setupCollectionCommands.push(sprintf('use %s\n', myDatabase));
setupCollectionCommands.push(sprintf('db.%s.drop();\n', randomCollectionName));

// Command that checks the user is OK
const validateCollectionCmd = sprintf(
  '\ndb.%s.stats();\n',
  randomCollectionName,
);
const dropCollectionCmd = sprintf('\ndb.%s.drop();\n', randomCollectionName);

// Run the test
test('Create Collection template', (done) => {
  fs.readFile(templateToBeTested, (err, data) => {
    if (!err) {
      const templateSource = data.toString();
      const compiledTemplate = hbs.compile(templateSource);
      const createCollectionCommands = compiledTemplate(templateInput);
      let mongoCommands = '';
      setupCollectionCommands.forEach((c) => {
        mongoCommands += c;
      });
      mongoCommands += createCollectionCommands;
      mongoCommands += validateCollectionCmd;
      mongoCommands += dropCollectionCmd + '\nexit\n';
      const matchString = 'totalIndexSize';
      common.mongoOutput(mongoCommands).then((output) => {
        expect(output).toEqual(expect.stringMatching(matchString));
        done();
      });
    }
  });
});
