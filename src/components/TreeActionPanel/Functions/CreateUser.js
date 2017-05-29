/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-09T10:24:13+10:00
 */

import * as common from './Common.js';

export const CreateUser = {
  // Prefill function for alter user
  dbcoda_CreateUserPreFill: () => {
    const data = {};
    data.Database = 'admin';
    data.Roles = [];
    data.Roles.push({ Database:'admin', Role:'read'});
    return data;
  },
  dbcoda_validateUser: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Roles')) {
      throw new Error('dbcoda: Alter user should include as least one role');
    }
    return true;
  },
  dbcoda_listdb: common.dbcoda_listdb,
  dbcoda_listdb_parse: common.dbcoda_listdb_parse,
  dbcoda_listRoles: common.dbcoda_listRoles,
  dbcoda_listRoles_parse: common.dbcoda_listRoles_parse
};
