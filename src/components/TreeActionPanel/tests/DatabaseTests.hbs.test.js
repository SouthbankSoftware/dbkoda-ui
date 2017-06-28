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
        const templateToBeTested = './src/components/TreeActionPanel/Templates/GetParameters.hbs';
        fs.readFile(templateToBeTested, (err, template) => {
            if (err) {
              throw err;
            }
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
        const templateToBeTested = './src/components/TreeActionPanel/Templates/GetLog.hbs';

        fs.readFile(templateToBeTested, (err, template) => {
            if (err) {
              throw err;
            }
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
        const templateToBeTested = './src/components/TreeActionPanel/Templates/SetParameter.hbs';

        fs.readFile(templateToBeTested, (err, template) => {
            if (err) {
              throw err;
            }
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
            if (err) {
              throw err;
            }
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
