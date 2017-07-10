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
const templateToBeTested = './src/components/TreeActionPanel/Templates/AlterUser.hbs';
const templateInput = require('./AlterUser.hbs.input.json');
const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');

hbs.registerHelper('json', jsonHelper);

// Random username for the test
const randomUser = 'user' + Math.floor(Math.random() * 10000000);
const adminRandomUser = 'admin.' + randomUser;

// Data that is input to the handlebars template


templateInput.UserId = adminRandomUser;
templateInput.UserName = randomUser;

// Command to create the user
const createUserCmd = sprintf('db.getSiblingDB("admin").createUser(    {user: "%s" ,    pwd:  "password" ,   roles:[]}   ,{w: "majority"}  );\n', randomUser);

// Command to drop the user
const dropUserCmd = sprintf('db.getSiblingDB("admin").dropUser(   "%s",{w: "majority"}) ;\n', randomUser);

// Command that checks the user is OK
const validateUsesrCmd = sprintf(
    '\nvar  userDoc=db.getSiblingDB("admin").system.users.find({_id:"%s"}).toArray()[0];\n  if (userDoc.roles.length==4) print (userDoc._id+" updated ok"); \n',
    adminRandomUser);

// Run the test
test('Alter User template', (done) => {
    fs.readFile(templateToBeTested, (err, data) => {
        if (!err) {
            const templateSource = data.toString();
            const compiledTemplate = hbs.compile(templateSource);
            const AlterUsercommands = compiledTemplate(templateInput);
            const mongoCommands = createUserCmd +
                AlterUsercommands +
                validateUsesrCmd +
                dropUserCmd +
                '\nexit\n';
            if (debug) console.log(mongoCommands);
            const matchString = sprintf('%s updated ok', adminRandomUser);
            common.mongoOutput(mongoCommands).then((output) => {
                expect(output).toEqual(expect.stringMatching(matchString));
                done();
            });
        } else {
            throw new Error(err);
        }
    });
});
