/**
*  Unit Test for ALter user template

* @Author: Guy Harrison

*/
//
// Unit test for AlterUser template
//
// TODO: Fix dependency on local mongo (use mlaunch?)
const debug = false;
const templateToBeTested = './src/components/TreeActionPanel/Templates/DropCollection.hbs';
const templateInput = require('./DropCollection.hbs.input.json');
const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');

hbs.registerHelper('json', jsonHelper);

// Random collection for the test
const randomCollectionName = 'collection' + Math.floor(Math.random() * 10000000);

templateInput.CollectionName = randomCollectionName;

// Command to drop the user
const setupCollectionCommands = [];
setupCollectionCommands.push(sprintf('use test\n'));
setupCollectionCommands.push(sprintf('db.%s.drop();\n', randomCollectionName));
setupCollectionCommands.push(sprintf('db.%s.insertOne({a:1,b:1,c:{d:1,e:1}});\n', randomCollectionName));

// Command that checks the collection exists
const validateCollectionCmd = sprintf('\nprint ( "collection has storage="+(db.%s.stats().size>0));\n', randomCollectionName);

// Run the test
test('Drop all index template', (done) => {
    fs.readFile(templateToBeTested, (err, data) => {
        if (!err) {
            const templateSource = data.toString();
            const compiledTemplate = hbs.compile(templateSource);
            const DropCollectionCommands = compiledTemplate(templateInput);
            let mongoCommands = '';
            setupCollectionCommands.forEach((c) => {
                mongoCommands += c;
            });
            mongoCommands += validateCollectionCmd;
            mongoCommands += DropCollectionCommands;
            mongoCommands += validateCollectionCmd;
            mongoCommands += '\nexit\n';
            if (debug) console.log(mongoCommands);
            const matchString = sprintf('collection has storage=true', randomCollectionName);  // collection were created
            const matchString2 = sprintf('collection has storage=false', randomCollectionName); // collection were dropped
            common
                .mongoOutput(mongoCommands)
                .then((output) => {
                    expect(output).toEqual(expect.stringMatching(matchString));
                    expect(output).toEqual(expect.stringMatching(matchString2));
                    done();
                });
        }
    });
});
