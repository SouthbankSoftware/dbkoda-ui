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
const debug = false;
const templateToBeTested = './src/components/TreeActionPanel/Templates/DropDatabase.hbs';
const templateInput = require('./DropDatabase.hbs.input.json');
const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');

hbs.registerHelper('json', jsonHelper);

// Random collection for the test
const randomDatabase = 'database' + Math.floor(Math.random() * 10000000);

templateInput.Database = randomDatabase;

// Command to drop the user
const setupDatabaseCommands = [];
setupDatabaseCommands.push(sprintf('use %s\n', randomDatabase));
setupDatabaseCommands.push(sprintf('db.testCollection.drop();\n'));
setupDatabaseCommands.push(sprintf('db.testCollection.insertOne({a:1,b:1,c:{d:1,e:1}});\n'));

// Command that checks the collection exists
const validateDbCmd = sprintf('\nprint ( "database has collections="+db.getSiblingDB("%s").stats().collections);\n', randomDatabase);

// Run the test
test('Drop Database template', (done) => {
    fs.readFile(templateToBeTested, (err, data) => {
        if (!err) {
            const templateSource = data.toString();
            const compiledTemplate = hbs.compile(templateSource);
            const DropDatabaseCommands = compiledTemplate(templateInput);
            let mongoCommands = '';
            setupDatabaseCommands.forEach((c) => {
                mongoCommands += c;
            });
            mongoCommands += validateDbCmd;
            mongoCommands += DropDatabaseCommands;
            mongoCommands += validateDbCmd;
            mongoCommands += '\nexit\n';
            if (debug) console.log(mongoCommands);
            const matchString = sprintf('database has collections=1', randomDatabase);  // database were created
            const matchString2 = sprintf('database has collections=0', randomDatabase); // database were dropped
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
