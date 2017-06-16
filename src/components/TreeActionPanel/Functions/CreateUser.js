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
  dbkoda_CreateUserPreFill: () => {
    const data = {};
    data.Database = 'admin';
    data.Roles = [];
    data.Roles.push({ Database:'admin', Role:'read'});
    return data;
  },
  dbkoda_validateUser: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Roles')) {
      throw new Error('dbkoda: Alter user should include as least one role');
    }
    return true;
  },
  dbkoda_listdb: common.dbkoda_listdb,
  dbkoda_listdb_parse: common.dbkoda_listdb_parse,
  dbkoda_listRoles: common.dbkoda_listRoles,
  dbkoda_listRoles_parse: common.dbkoda_listRoles_parse
};
