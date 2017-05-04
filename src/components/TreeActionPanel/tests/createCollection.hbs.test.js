/**
*  Unit Test for ALter user template

* @Author: Guy Harrison

*/
//
// Unit test for AlterUser template
//
// TODO: Fix dependency on local mongo (use mlaunch?)

const debug = false;
const templateToBeTested = './src/components/TreeActionPanel/Templates/CreateCollection.hbs';
const templateInput = require('./CreateCollection.hbs.input.json');
const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');

hbs.registerHelper('json', jsonHelper);

// Random collection for the test
const randomCollectionName = 'collection' + Math.floor(Math.random() * 10000000);

const myDatabase = templateInput.Database;
templateInput.CollectionName = randomCollectionName;

// Command to drop the collection
const setupCollectionCommands = [];
setupCollectionCommands.push(sprintf('use %s\n', myDatabase));
setupCollectionCommands.push(sprintf('db.%s.drop();\n', randomCollectionName));

// Command that checks the user is OK
const validateCollectionCmd = sprintf('\ndb.%s.stats();\n', randomCollectionName);
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
      if (debug) console.log(mongoCommands);
      const matchString = 'totalIndexSize';
      common
        .mongoOutput(mongoCommands)
        .then((output) => {
          expect(output).toEqual(expect.stringMatching(matchString));
          done();
        });
    }
  });
});
