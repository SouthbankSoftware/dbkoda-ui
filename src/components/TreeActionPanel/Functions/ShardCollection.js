/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T12:27:05+10:00
 */

import * as common from './Common.js';

export const ShardCollection = {
    // Prefill function for alter user
    dbcoda_ShardCollectionPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        data.Unique = false;
        return data;
    },
    dbcoda_indexOptions: () => {
        return ('db');
    },
    dbcoda_indexOptions_parse: (res) => {
        console.log(res);
        return ([1, -1, '"hashed"']);
    },
    dbcodaListAttributes: common.dbcodaListAttributes,
    dbcodaListAttributes_parse: common.dbcodaListAttributes_parse
};
