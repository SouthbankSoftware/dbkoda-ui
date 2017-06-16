/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T12:27:05+10:00
 */

// import * as common from './Common.js';

export const GetLog = {
    // Prefill function for alter user
    dbkodaGetLogPreFill: () => {
        const data = {};
        data.logType = 'global';
        return data;
    },
    dbkodaGetLogArgs: () => {
        return ('db.adminCommand({getLog: "*" }).names');
    },
    dbkodaGetLogArgs_parse: (res) => {
        console.log(res);
        return (res);
    }
};
