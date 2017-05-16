/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T10:45:15+10:00
 */

// import * as common from './Common.js';

export const SetLogLevel = {
    // Prefill function for alter user
    dbenvyLoggingLevelPreFill: () => {
        return 'db.getSiblingDB("admin").runCommand({  getParameter:1,"logComponentVerbosity":1}).logComponentVerbosity';
    },
    dbenvyLoggingLevelPreFill_parse: (parmDoc) => {
        console.log(parmDoc);
        const outputDoc = {};
        outputDoc.verbosity = parmDoc.verbosity;
        // outputDoc.CustomData = userDoc.customData;
        outputDoc.Components = [];
        Object.keys(parmDoc).forEach((component) => {
            if (component !== 'verbosity') {
                outputDoc.Components.push({
                    Component: component,
                    Level: parmDoc[component].verbosity,
                });
            }
        });

        return outputDoc;
    }
};
