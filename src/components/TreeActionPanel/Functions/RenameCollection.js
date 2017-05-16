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
    dbenvy_RenameCollectionPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        data.dropTarget = false;
        return data;
    },
    dbenvy_listdb: common.dbenvy_listdb,
    dbenvy_listdb_parse: common.dbenvy_listdb_parse,
    dbenvy_listcollections: common.dbenvy_listcollections,
    dbenvy_listcollections_parse: common.dbenvy_listcollections_parse,
    dbenvyListAttributes: common.dbenvyListAttributes,
    dbenvyListAttributes_parse: common.dbenvyListAttributes_parse
};
