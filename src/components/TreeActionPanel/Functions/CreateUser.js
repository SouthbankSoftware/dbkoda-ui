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
  dbenvy_CreateUserPreFill: () => {
    const data = {};
    data.Database = 'test';
    data.Roles = [];
    data.Roles.push({ Database:'test', Role:'read'});
    return data;
  },
  dbenvy_validateUser: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Roles')) {
      throw new Error('dbenvy: Alter user should include as least one role');
    }
    return true;
  },
  dbenvy_listdb: common.dbenvy_listdb,
  dbenvy_listdb_parse: common.dbenvy_listdb_parse,
  dbenvy_listRoles: common.dbenvy_listRoles,
  dbenvy_listRoles_parse: common.dbenvy_listRoles_parse
};
