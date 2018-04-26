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
 * @Last modified time: 2017-09-13T09:05:09+10:00
 */

import * as common from './Common.js';

export const DropRole = {
  // Prefill function for create role
  dbkoda_DropRolePreFill: params => {
    const data = {};
    data.Database = params.parentDB;
    data.RoleName = params.RoleName;
    return data;
  },
  dbkoda_validateDropRole: inputDoc => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'RoleName')) {
      throw new Error('dbkoda: Drop Role requires the name of the role to drop');
    }
    return true;
  },
  dbkoda_listdb: common.dbkoda_listdb,
  dbkoda_listdb_parse: common.dbkoda_listdb_parse
};
