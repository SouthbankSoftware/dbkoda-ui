/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T12:12:33+10:00
 */

import * as common from './Common.js';

export const SimpleQuery = {
    executeCommand: null,
    setExecuteFunction: (cbFuncExecute) => {
        SimpleQuery.executeCommand = cbFuncExecute;
    },
    // Prefill function for alter user
    dbcoda_SimpleQueryPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        data.UseOr = false;
        data.IncludeProjection = true;
        data.Projections = [];
        data.FilterKeys = [];
        data.Sort = false;
        data.Count = false;
        return data;
    },
    dbcoda_sortOptions: () => {
        return ('db');
    },
    dbcoda_sortOptions_parse: (res) => {
        console.log(res);
        return ([1, -1]);
    },
    dbcoda_listdb: common.dbcoda_listdb,
    dbcoda_listdb_parse: common.dbcoda_listdb_parse,
    dbcoda_listcollections: common.dbcoda_listcollections,
    dbcoda_listcollections_parse: common.dbcoda_listcollections_parse,
    dbcodaListAttributes: common.dbcodaListAttributes,
    dbcodaListAttributes_parse: common.dbcodaListAttributes_parse
};
