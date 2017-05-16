/**
*  Unit Test for ALter user template

* @Author: Guy Harrison

*/
//
// Unit test for AlterUser template
//
// TODO: Fix dependency on local mongo (use mlaunch?)
const debug = false;

const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');

hbs.registerHelper('json', jsonHelper);

// Random collection for the test
const randomCollectionName = 'collection' + Math.floor(Math.random() * 10000000);



// Command to drop the user

describe('Miscellaneous collection tests', () => {
    beforeAll((done) => {
        const setupCollectionCommands = [];
        setupCollectionCommands.push(sprintf('use test\n'));
        setupCollectionCommands.push(sprintf('db.%s.drop();\n', randomCollectionName));
        setupCollectionCommands.push(sprintf('db.%s.insertOne({a:1,b:1,c:{d:1,e:1}});\n', randomCollectionName));

        // Command that checks the collection exists
        const validateCollectionCmd = sprintf('\nprint ( "collection has storage="+(db.%s.stats().size>0));\n', randomCollectionName);
        let mongoCommands = '';
        setupCollectionCommands.forEach((c) => {
            mongoCommands += c;
        });
        mongoCommands += validateCollectionCmd;
        mongoCommands += '\nexit\n';
        if (debug) {
            console.log(mongoCommands);
        }
        const matchString = sprintf('collection has storage=true', randomCollectionName); // collection were created
        common
            .mongoOutput(mongoCommands)
            .then((output) => {
                expect(output).toEqual(expect.stringMatching(matchString));
                done();
            });
    });

    afterAll((done) => {
        const setupCollectionCommands = [];
        setupCollectionCommands.push(sprintf('use test\n'));
        setupCollectionCommands.push(sprintf('db.%s.drop();\n', randomCollectionName));

        const validateCollectionCmd = sprintf('\nprint ( "collection has storage="+(db.%s.stats().size>0));\n', randomCollectionName);
        let mongoCommands = '';
        setupCollectionCommands.forEach((c) => {
            mongoCommands += c;
        });
        mongoCommands += validateCollectionCmd;
        mongoCommands += '\nexit\n';
        if (debug) {
            console.log(mongoCommands);
        }
        const matchString = sprintf('collection has storage=false', randomCollectionName); // collection were created
        common
            .mongoOutput(mongoCommands)
            .then((output) => {
                expect(output).toEqual(expect.stringMatching(matchString));
                done();
            });
    });

    test('Rename Collection', (done) => {
        const templateToBeTested = './src/components/TreeActionPanel/Templates/RenameCollection.hbs';
        fs.readFile(templateToBeTested, (err, data) => {
            if (!err) {
                const randomCollectionName = 'collection' + Math.floor(Math.random() * 10000000);
                const templateInput = {};
                templateInput.Database = 'test';
                templateInput.CollectionName = randomCollectionName;
                templateInput.NewCollectionName = randomCollectionName + 'renamed';
                templateInput.dropTarget = false;
                const templateSource = data.toString();
                const compiledTemplate = hbs.compile(templateSource);
                const RenameCollectionCommands = compiledTemplate(templateInput);

                const validateCollectionCmd = sprintf('\nprint ( "original collection has storage="+(db.%s.stats().size>0));\n',
                    randomCollectionName);
                const validateRenamedCollectionCmd = sprintf('\nprint ( "renamed collection has storage="+(db.%s.stats().size>0));\n',
                    templateInput.NewCollectionName);
                let mongoCommands = '';
                mongoCommands += 'use test\n';
                mongoCommands += sprintf('db.%s.insertOne({a:1})\n', randomCollectionName);
                mongoCommands += validateCollectionCmd;
                mongoCommands += RenameCollectionCommands;
                mongoCommands += validateRenamedCollectionCmd;
                mongoCommands += sprintf('db.%s.drop()\n', templateInput.NewCollectionName);
                mongoCommands += '\nexit\n';
                if (debug) {
                    console.log(mongoCommands);
                }
                const matchString1 = 'original collection has storage=true';
                const matchString2 = 'renamed collection has storage=true';
                common
                    .mongoOutput(mongoCommands)
                    .then((output) => {
                        expect(output).toEqual(expect.stringMatching(matchString1));
                        expect(output).toEqual(expect.stringMatching(matchString2));
                        done();
                    });
            }
        });
    });

    test('Compact Collection', (done) => {
        const templateToBeTested = './src/components/TreeActionPanel/Templates/CompactCollection.hbs';
        const templateInput = require('./CompactCollection.hbs.input.json');
        fs.readFile(templateToBeTested, (err, data) => {
            if (!err) {
                templateInput.CollectionName = randomCollectionName;
                const templateSource = data.toString();
                const compiledTemplate = hbs.compile(templateSource);
                const CompactCollectionCommands = compiledTemplate(templateInput);
                let mongoCommands = CompactCollectionCommands;
                mongoCommands += '\nexit\n';
                if (debug) {
                    console.log(mongoCommands);
                }
                const matchString = '{ "ok" : 1 }'; // collection was compacted
                common
                    .mongoOutput(mongoCommands)
                    .then((output) => {
                        expect(output).toEqual(expect.stringMatching(matchString));
                        done();
                    });
            }
        });
    }, 20000); // compact may take time

    test('Validate Collection', (done) => {
        const templateToBeTested = './src/components/TreeActionPanel/Templates/ValidateCollection.hbs';

        fs.readFile(templateToBeTested, (err, data) => {
            if (!err) {
                const templateInput = {};
                templateInput.Database = 'test';
                templateInput.CollectionName = randomCollectionName;
                templateInput.full = false;
                templateInput.scandata = true;
                const templateSource = data.toString();
                const compiledTemplate = hbs.compile(templateSource);
                const ValidateCollectionCommands = compiledTemplate(templateInput);
                let mongoCommands = ValidateCollectionCommands;
                mongoCommands += '\nexit\n';
                if (debug) {
                    console.log(mongoCommands);
                }
                const matchString = 'keysPerIndex';
                common
                    .mongoOutput(mongoCommands)
                    .then((output) => {
                        expect(output).toEqual(expect.stringMatching(matchString));
                        done();
                    });
            }
        });
    }); // compact may take time
});
