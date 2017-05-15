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
    dbenvy_CollectionStatsPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        return data;
    },
  dbenvy_listdb: common.dbenvy_listdb,
  dbenvy_listdb_parse: common.dbenvy_listdb_parse,
  dbenvy_listcollections: common.dbenvy_listcollections,
  dbenvy_listcollections_parse: common.dbenvy_listcollections_parse
};
