/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T12:27:05+10:00
 */

import * as common from './Common.js';

export const RenameCollection = {
    // Prefill function for alter user
    dbcoda_RenameCollectionPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        data.dropTarget = false;
        return data;
    },
    dbcoda_listdb: common.dbcoda_listdb,
    dbcoda_listdb_parse: common.dbcoda_listdb_parse,
    dbcoda_listcollections: common.dbcoda_listcollections,
    dbcoda_listcollections_parse: common.dbcoda_listcollections_parse,
    dbcodaListAttributes: common.dbcodaListAttributes,
    dbcodaListAttributes_parse: common.dbcodaListAttributes_parse
};
