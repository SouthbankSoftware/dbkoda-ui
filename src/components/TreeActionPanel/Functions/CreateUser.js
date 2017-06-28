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
 */

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
