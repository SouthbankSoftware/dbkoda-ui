/**
*  General unit tests

* @Author: Guy Harrison

*/
//
const debug = false;
const hbs = require('handlebars');
const fs = require('fs');
// const sprintf = require('sprintf-js').sprintf;
const common = require('./common.js');
const jsonHelper = require('../../../helpers/handlebars/json.js');
// const shelljs = require('shelljs');

hbs.registerHelper('json', jsonHelper);


describe('General database hbr tests', () => {
    beforeAll(() => {});

    afterAll(() => {});

    test('get Parameters', (done) => {
        // Random database for the test
        const getParametersInput = {};
        getParametersInput.AllParameters = true;
        getParametersInput.getCmdLineOpts = true;
        const templateToBeTested = './src/components/TreeActionPanel/Templates/getParameters.hbs';

        fs.readFile(templateToBeTested, (err, template) => {
            const getParameters = template.toString();
            const getParametersTemplate = hbs.compile(getParameters);
            const getParametersCommands = getParametersTemplate(getParametersInput);

            let mongoCommands = getParametersCommands;
            mongoCommands += '\nexit\n';
            if (debug) {
                console.log(mongoCommands);
            }
            const matchString = 'argv';
            const matchString2 = 'authenticationMechanisms';
            common
                .mongoOutput(mongoCommands)
                .then((output) => {
                    expect(output).toEqual(expect.stringMatching(matchString));
                    expect(output).toEqual(expect.stringMatching(matchString2));
                    done();
                });
        });
    });


    test('get Log', (done) => {
        // Random database for the test
        const getLog = {};
        getLog.logType = 'global';
        const templateToBeTested = './src/components/TreeActionPanel/Templates/getLog.hbs';

        fs.readFile(templateToBeTested, (err, template) => {
            const getParameters = template.toString();
            const getParametersTemplate = hbs.compile(getParameters);
            const getParametersCommands = getParametersTemplate(getLog);

            let mongoCommands = getParametersCommands;
            mongoCommands += '\nexit\n';
            if (debug) {
                console.log(mongoCommands);
            }
            const matchString = '"ok" : 1';

            common
                .mongoOutput(mongoCommands)
                .then((output) => {
                    expect(output).toEqual(expect.stringMatching(matchString));
                    done();
                });
        });
    });

    test('set Parameter', (done) => {
        // Random database for the test
        const setparameterData = {};
        setparameterData.Parameter = 'logLevel';
        setparameterData.Value = 3;
        const templateToBeTested = './src/components/TreeActionPanel/Templates/setParameter.hbs';

        fs.readFile(templateToBeTested, (err, template) => {
            const setParameter = template.toString();
            const getParametersTemplate = hbs.compile(setParameter);
            const getParametersCommands = getParametersTemplate(setparameterData);

            let mongoCommands = getParametersCommands;
            mongoCommands += '\nexit\n';
            if (debug) {
                console.log(mongoCommands);
            }
            const matchString = '"ok" : 1';

            common
                .mongoOutput(mongoCommands)
                .then((output) => {
                    expect(output).toEqual(expect.stringMatching(matchString));
                    done();
                });
        });
    });
     test('set Log Level', (done) => {
        // Random database for the test
        const setLogLevelData = {};
        setLogLevelData.verbosity = 1;
        setLogLevelData.Components = [];
        setLogLevelData.Components.push({'Component':'command', 'Level':1});
        const templateToBeTested = './src/components/TreeActionPanel/Templates/SetLogLevel.hbs';

        fs.readFile(templateToBeTested, (err, template) => {
            const setParameter = template.toString();
            const getParametersTemplate = hbs.compile(setParameter);
            const getParametersCommands = getParametersTemplate(setLogLevelData);

            let mongoCommands = getParametersCommands;
            mongoCommands += '\nexit\n';
            if (debug) {
                console.log(mongoCommands);
            }
            const matchString = '"ok" : 1';

            common
                .mongoOutput(mongoCommands)
                .then((output) => {
                    expect(output).toEqual(expect.stringMatching(matchString));
                    done();
                });
        });
    });
});
