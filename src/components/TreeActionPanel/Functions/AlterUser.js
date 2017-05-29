/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-26T12:37:59+10:00
 */

import * as common from './Common.js';

export const AlterUser = {
  // Prefill function for alter user
  dbcoda_AlterUserPreFill: (params) => {
    const userId = params.UserId;
    return `db.getSiblingDB("admin").system.users.find({"_id": "${userId}"}).toArray()`;
  },
  dbcoda_AlterUserPreFill_parse: (userDocs) => {
    console.log(userDocs);
    if (userDocs.length == 0) {
      throw new Error('No user found for Alter User');
    } else if (userDocs.length > 1) {
      throw new Error('dbcoda: Too many users found for Alter User');
    }
    const userDoc = userDocs[0];
    const outputDoc = {};
    outputDoc.UserId = userDoc._id;
    outputDoc.Database = userDoc.db;
    outputDoc.UserName = userDoc.user;
    // outputDoc.CustomData = userDoc.customData;
    outputDoc.Roles = [];
    userDoc.roles.forEach((role) => {
      outputDoc.Roles.push({
        Database: role.db,
        Role: role.role,
      });
    });

    return outputDoc;
  },
  dbcoda_validateUser: (inputDoc) => {
    if (Object.prototype.hasOwnProperty.call(inputDoc, 'Roles') && inputDoc.Roles.length > 0) {
      return true;
    }
    throw new Error('dbcoda: Alter user should include as least one role');
  },
  dbcoda_listdb: common.dbcoda_listdb,
  dbcoda_listdb_parse: common.dbcoda_listdb_parse,
  dbcoda_listRoles: common.dbcoda_listRoles,
  dbcoda_listRoles_parse: common.dbcoda_listRoles_parse
};
