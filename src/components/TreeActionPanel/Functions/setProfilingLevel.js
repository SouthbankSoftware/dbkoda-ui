/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T10:45:15+10:00
 */

// import * as common from './Common.js';
const sprintf = require('sprintf-js').sprintf;

export const setProfilingLevel = {
    // Prefill function for alter user
    dbenvy_setProfilingLevelPreFill: (params) => {
        const dbName = params.dbName;
        const cmd = sprintf('dbe.profileLevels("%s");', dbName);
        return cmd;
    },
    dbenvy_setProfilingLevelPreFill_parse: (res) => {
        const outputDoc = {};
        if (res.mongos) {
            outputDoc.Database = 'Not supported on Mongos';
        } else {
            outputDoc.Database = res.dbName;
            outputDoc.level = res.was;
            outputDoc.slowms = res.slowms;
        }
        return outputDoc;
    }
};
