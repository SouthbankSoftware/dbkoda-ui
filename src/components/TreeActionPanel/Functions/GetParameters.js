/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T12:27:05+10:00
 */

import * as common from './Common.js';

export const GetParameters = {
    // Prefill function for alter user
    dbcoda_GetParametersPreFill: () => {
        const data = {};
        data.AllParameters = true;
        data.getCmdLineOpts = true;
        return data;
    },
    dbcodaParameterList: common.dbcodaParameterList,
    dbcodaParameterList_parse: common.dbcodaParameterList_parse
};
