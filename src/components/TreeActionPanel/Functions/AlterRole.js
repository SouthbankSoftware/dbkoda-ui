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
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @Author: chris
 * @Date:   2017-09-12T09:19:17+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-09-13T11:42:50+10:00
 */

import * as common from './Common.js';

export const AlterRole = {
  // Prefill function for alter role
  dbkoda_AlterRolePreFill: (params) => {
    return `db.getSiblingDB("admin").getRole("${params.RoleName}", { showPrivileges: true, showBuiltinRoles: false })`;
  },
  dbkoda_AlterRolePreFill_parse: (roleDoc) => {
    console.log(roleDoc);
    if (!roleDoc) {
      throw new Error('No role found for Alter Role');
    }
    const outputDoc = {};
    outputDoc.Database = roleDoc.db;
    outputDoc.RoleName = roleDoc.role;
    outputDoc.Roles = roleDoc.roles.map((role) => {
      return { Database: role.db, Role: role.role };
    });
    outputDoc.Privileges = roleDoc.privileges.map((privilege) => {
      return {
        Database: privilege.resource.db,
        Collection: privilege.resource.collection,
        Cluster: privilege.resource.cluster,
        Actions: privilege.actions
      };
    });
    console.log(outputDoc);
    return outputDoc;
  },
  dbkoda_validateAlterRole: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'RoleName')) {
      throw new Error('dbkoda: Alter Role requires the name of the role to be modified');
    }
    return true;
  },
  dbkoda_listdb: common.dbkoda_listdb,
  dbkoda_listdb_parse: common.dbkoda_listdb_parse,
  dbkoda_listRoles: common.dbkoda_listRoles,
  dbkoda_listRoles_parse: common.dbkoda_listRoles_parse,
  dbkoda_listActions: common.dbkoda_listActions,
  dbkoda_listActions_parse: common.dbkoda_listActions_parse
};
