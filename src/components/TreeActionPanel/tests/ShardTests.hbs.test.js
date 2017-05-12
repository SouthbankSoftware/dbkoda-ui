/**
*  Unit Test for ALter user template

* @Author: Guy Harrison

*/
//
// Unit test for AlterUser template
//
// TODO: Fix dependency on local mongo (use mlaunch?)
const debug = false;
const enableShardingTemplate = './src/components/TreeActionPanel/Templates/EnableSharding.hbs';
const shardCollectionTemplate = './src/components/TreeActionPanel/Templates/ShardCollection.hbs';
const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');
const shelljs = require('shelljs');

hbs.registerHelper('json', jsonHelper);


const shardPort = Math.floor(Math.random() * 7000) + 6000;
const tmpDir = 'tmpd' + Math.floor(Math.random() * 10000000);

describe('Shard-specific tests', () => {
    beforeAll(() => {
        if (debug) console.log('MongoDB will be setup on port ' + shardPort);
        shelljs.exec('mkdir ' + tmpDir);
        const command = sprintf('mlaunch init --replicaset --dir %s --port %s ' +
            ' --nodes 2 --arbiter --sharded 2   --mongos 1 --config 1  --noauth',
            tmpDir, shardPort);
        if (debug) console.log(command);
        shelljs.exec(command);
    });

    afterAll(() => {
        const command = sprintf('mlaunch stop  --dir %s ',
            tmpDir);
        if (debug) console.log(command);
        shelljs.exec(command);
        shelljs.exec('rm -rf ' + tmpDir);
    });

    test('Test sharding templates', (done) => {
        // Random database for the test
        const randomDatabase = 'database' + Math.floor(Math.random() * 10000000);
        const randomCollection = 'collection' + Math.floor(Math.random() * 10000000);

        const enableShadingInput = {};
        enableShadingInput.Database = randomDatabase;

        const shardCollectionInput = {};
        shardCollectionInput.Database = randomDatabase;
        shardCollectionInput.CollectionName = randomCollection;
        shardCollectionInput.Keys = [{
            AttributeName: 'a',
            'Direction': 1
        }];
        shardCollectionInput.Unique = false;

        // Command to drop the user
        const setupDatabaseCommands = [];
        setupDatabaseCommands.push(sprintf('use %s\n', randomDatabase));

        setupDatabaseCommands.push(sprintf('db.getCollection("%s").drop();\n', randomCollection));

        setupDatabaseCommands.push(sprintf('db.getCollection("%s").insertOne({a:1,b:1,c:{d:1,e:1}});\n', randomCollection));
        setupDatabaseCommands.push(sprintf('db.getCollection("%s").createIndex({a:1});\n', randomCollection));
        const dropDatabaseCommands = sprintf('db.getSiblingDB("%s").dropDatabase()', randomDatabase);
        fs.readFile(enableShardingTemplate, (err, shardTemplate) => {
            fs.readFile(shardCollectionTemplate, (err, collectionTemplate) => {
                const enableShardingSource = shardTemplate.toString();
                const enableShardingTemplate = hbs.compile(enableShardingSource);
                const enableShardingCommands = enableShardingTemplate(enableShadingInput);

                const shardCollectionSource = collectionTemplate.toString();
                const shardCollectionTemplate = hbs.compile(shardCollectionSource);
                const shardCollectionCommands = shardCollectionTemplate(shardCollectionInput);

                let mongoCommands = '';
                setupDatabaseCommands.forEach((c) => {
                    mongoCommands += c;
                });

                mongoCommands += enableShardingCommands;
                mongoCommands += shardCollectionCommands;
                mongoCommands += dropDatabaseCommands;
                mongoCommands += '\nexit\n';
                if (debug) {
                    console.log(mongoCommands);
                }
                const matchString = sprintf('"collectionsharded" : "%s.%s", "ok" : 1', randomDatabase, randomCollection); // database were created
                common
                    .mongoPortOutput(shardPort, mongoCommands)
                    .then((output) => {
                        expect(output).toEqual(expect.stringMatching(matchString));
                        done();
                    });
            });
        });
    });
});
