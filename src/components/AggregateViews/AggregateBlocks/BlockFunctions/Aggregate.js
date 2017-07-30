/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You shouldhave received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */
import * as common from '../../../TreeActionPanel/Functions/Common.js';

export const Aggregate = {
  // Prefill function for alter user
  dbkoda_AggregateBlockPreFill: (params) => {
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
