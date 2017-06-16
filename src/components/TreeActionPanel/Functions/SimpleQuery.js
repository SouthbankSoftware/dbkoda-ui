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
    dbkoda_SimpleQueryPreFill: (params) => {
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
    dbkoda_sortOptions: () => {
        return ('db');
    },
    dbkoda_sortOptions_parse: (res) => {
        console.log(res);
        return ([1, -1]);
    },
    dbkoda_listdb: common.dbkoda_listdb,
    dbkoda_listdb_parse: common.dbkoda_listdb_parse,
    dbkoda_listcollections: common.dbkoda_listcollections,
    dbkoda_listcollections_parse: common.dbkoda_listcollections_parse,
    dbkodaListAttributes: common.dbkodaListAttributes,
    dbkodaListAttributes_parse: common.dbkodaListAttributes_parse
};
