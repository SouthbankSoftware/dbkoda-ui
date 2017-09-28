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
 * @Last modified time: 2017-09-12T09:19:47+10:00
 */

import * as common from './Common.js';

export const CreateRole = {
  // Prefill function for create role
  dbkoda_CreateRolePreFill: (params) => {
    if (params.Database === 'Roles') {
      params.Database = '';
    }
    const data = {};
    data.Database = params.Database;
    data.Roles = [];
    data.Privileges = [];
    return data;
  },
  dbkoda_validateRole: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Database')) {
      throw new Error('dbkoda: Create Role requires a database to be selected');
    }
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'RoleName')) {
      throw new Error('dbkoda: Create Role requires a role name');
    }
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Roles') &&
      !Object.prototype.hasOwnProperty.call(inputDoc, 'Privileges')
    ) {
      throw new Error('dbkoda: Create Role should include at least one role or privilege');
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
