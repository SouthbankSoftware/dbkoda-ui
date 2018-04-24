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
const templateToBeTested = './src/components/TreeActionPanel/Templates/DropIndex.hbs';
const templateInput = require('./DropIndex.hbs.input.json');
const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');

hbs.registerHelper('json', jsonHelper);

// Random collection for the test
const randomCollectionName = 'collection' + Math.floor(Math.random() * 10000000);
const randomIndexName = randomCollectionName + '_i';

templateInput.CollectionName = randomCollectionName;
templateInput.IndexName = randomIndexName;

// Command to drop the user
const setupCollectionCommands = [];
setupCollectionCommands.push(sprintf('use test\n'));
setupCollectionCommands.push(sprintf('db.%s.drop();\n', randomCollectionName));
setupCollectionCommands.push(
  sprintf('db.%s.insertOne({a:1,b:1,c:{d:1,e:1}});\n', randomCollectionName)
);
setupCollectionCommands.push(
  sprintf('db.%s.createIndex({a:1},{"name":"%s"});\n', randomCollectionName, randomIndexName)
);

// Command that checks the user is OK
const validateIndexCmd = sprintf(
  '\ndb.%s.getIndexes().forEach(i=>{if (i.name==="%s") {print ("Found index "+i.name)}});',
  randomCollectionName,
  randomIndexName
);
const dropCollectionCmd = sprintf('\ndb.%s.drop();\n', randomCollectionName);

// Run the test
test('Create Index template', done => {
  fs.readFile(templateToBeTested, (err, data) => {
    if (!err) {
      const templateSource = data.toString();
      const compiledTemplate = hbs.compile(templateSource);
      const DropIndexCommands = compiledTemplate(templateInput);
      let mongoCommands = '';
      setupCollectionCommands.forEach(c => {
        mongoCommands += c;
      });
      mongoCommands += DropIndexCommands;
      mongoCommands += validateIndexCmd;
      mongoCommands += dropCollectionCmd + '\nexit\n';
      const matchString = sprintf('Found index %s', randomIndexName);
      const matchString2 = '{ "nIndexesWas" : 2, "ok" : 1 }';
      common.mongoOutput(mongoCommands).then(output => {
        expect(output).not.toEqual(expect.stringMatching(matchString));
        expect(output).toEqual(expect.stringMatching(matchString2));
        done();
      });
    }
  });
});
