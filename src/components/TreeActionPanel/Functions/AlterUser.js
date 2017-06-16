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
  dbkoda_AlterUserPreFill: (params) => {
    const userId = params.UserId;
    return `db.getSiblingDB("admin").system.users.find({"_id": "${userId}"}).toArray()`;
  },
  dbkoda_AlterUserPreFill_parse: (userDocs) => {
    console.log(userDocs);
    if (userDocs.length == 0) {
      throw new Error('No user found for Alter User');
    } else if (userDocs.length > 1) {
      throw new Error('dbkoda: Too many users found for Alter User');
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
  dbkoda_validateUser: (inputDoc) => {
    if (Object.prototype.hasOwnProperty.call(inputDoc, 'Roles') && inputDoc.Roles.length > 0) {
      return true;
    }
    throw new Error('dbkoda: Alter user should include as least one role');
  },
  dbkoda_listdb: common.dbkoda_listdb,
  dbkoda_listdb_parse: common.dbkoda_listdb_parse,
  dbkoda_listRoles: common.dbkoda_listRoles,
  dbkoda_listRoles_parse: common.dbkoda_listRoles_parse
};
