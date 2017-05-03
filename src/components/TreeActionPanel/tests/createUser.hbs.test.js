/**
*  Unit Test for ALter user template

* @Author: Guy Harrison

*/
//
// Unit test for AlterUser template
//
// TODO: Fix dependency on local mongo (use mlaunch?)
const templateToBeTested = './src/components/TreeActionPanel/Templates/CreateUser.hbs';
const templateInput = require('./CreateUser.hbs.input.json');
const hbs = require('handlebars');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');


// Random username for the test
const randomUser = 'user' + Math.floor(Math.random() * 10000000);
const adminRandomUser = 'admin.' + randomUser;

// Data that is input to the handlebars template


templateInput.UserId = adminRandomUser;
templateInput.UserName = randomUser;

// Command to drop the user
const dropUserCmd = sprintf('db.getSiblingDB("admin").dropUser( "%s",{w: "majority"}) ;\n', randomUser);

// Command that checks the user is OK
const validateUsesrCmd = sprintf(
    '\nvar  userDoc=db.getSiblingDB("admin").system.users.find({_id:"%s"}).toArray()[0];\n if (userDoc.roles.length==4) print (userDoc._id+" created ok"); \n',
    adminRandomUser);

// Run the test
test('Create User template', (done) => {
    fs.readFile(templateToBeTested, (err, data) => {
        if (!err) {
            const templateSource = data.toString();
            const compiledTemplate = hbs.compile(templateSource);
            const CreateUsercommands = compiledTemplate(templateInput);
            const mongoCommands = CreateUsercommands +
                validateUsesrCmd +
                dropUserCmd +
                '\nexit\n';
            // console.log(mongoCommands);
            const matchString = sprintf('%s created ok', adminRandomUser);
            common.mongoOutput(mongoCommands).then((output) => {
                expect(output).toEqual(expect.stringMatching(matchString));
                done();
            });
        }
    });
});
