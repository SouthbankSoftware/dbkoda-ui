/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-09T13:25:50+10:00
 */
import * as common from './Common.js';

export const CreateCollection = {
  // Prefill function for alter user
  dbcoda_CreateCollectionPreFill: (params) => {
    const Database = params.Database;
    const data = {};
    data.Database = Database;
    data.CollectionName = 'New Collection name';
    data.capped = false;
    return data;
  },
  dbcoda_validationLevel: () => {
    return ('db');
  },
  dbcoda_validationLevel_parse: (res) => {
    console.log(res);
    return (['off', 'moderate', 'strict']);
  },
  dbcoda_validationAction: () => {
    return ('db');
  },
  dbcoda_validationAction_parse: (res) => {
    console.log(res);
    return (['error', 'warn']);
  },
  dbcoda_listdb: common.dbcoda_listdb,
  dbcoda_listdb_parse: common.dbcoda_listdb_parse
};
