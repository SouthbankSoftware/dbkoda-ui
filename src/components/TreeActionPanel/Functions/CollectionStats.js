/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T12:12:33+10:00
 */

import * as common from './Common.js';

export const CollectionStats = {
    executeCommand: null,
    setExecuteFunction: (cbFuncExecute) => {
        CollectionStats.executeCommand = cbFuncExecute;
    },
    // Prefill function for alter user
    dbkoda_CollectionStatsPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        return data;
    },
  dbkoda_listdb: common.dbkoda_listdb,
  dbkoda_listdb_parse: common.dbkoda_listdb_parse,
  dbkoda_listcollections: common.dbkoda_listcollections,
  dbkoda_listcollections_parse: common.dbkoda_listcollections_parse
};
