/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T11:36:25+10:00
 */

import * as common from './Common.js';

export const DropIndex = {
    // Prefill function for alter user
    dbkoda_DropIndexPreFill: (params) => {
        const outputDoc = {};
        outputDoc.Database = params.Database;
        outputDoc.CollectionName = params.CollectionName;
        outputDoc.IndexName = params.IndexName;
        return outputDoc;
    },
    dbkoda_listdb: common.dbkoda_listdb,
    dbkoda_listdb_parse: common.dbkoda_listdb_parse,
    dbkoda_listcollections: common.dbkoda_listcollections,
    dbkoda_listcollections_parse: common.dbkoda_listcollections_parse
};
