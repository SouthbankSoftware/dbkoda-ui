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
 * @Last modified time: 2017-05-03T12:12:33+10:00
 */

import * as common from './Common.js';

// const sprintf = require('sprintf-js').sprintf;

export const SimpleQuery = {
  executeCommand: null,
  setExecuteFunction: cbFuncExecute => {
    SimpleQuery.executeCommand = cbFuncExecute;
  },
  // Prefill function for alter user
  dbkoda_SimpleQueryPreFill: params => {
    const data = {};
    data.Database = params.Database;
    data.CollectionName = params.CollectionName;
    data.UseOr = false;
    data.IncludeProjection = true;
    data.Projections = [];
    data.Projections.push({});
    data.Projections.push({ AttributeName: '_id', AttributeProjectionValue: 0 });
    data.FilterKeys = [];
    data.FilterKeys.push({ AttributeName: '_id', Operator: '$eq', Value: '""' });
    data.Sort = false;
    data.Count = false;
    return data;
  },
  dbkoda_sortOptions: () => {
    return 'db';
  },
  dbkoda_sortOptions_parse: () => {
    return [1, -1];
  },
  dbkodaListProjections: () => {
    return 'db';
  },
  dbkodaListProjections_parse: () => {
    return ['0', '1'];
  },
  dbkoda_listdb: common.dbkoda_listdb,
  dbkoda_listdb_parse: common.dbkoda_listdb_parse,
  dbkoda_listcollections: common.dbkoda_listcollections,
  dbkoda_listcollections_parse: common.dbkoda_listcollections_parse,
  dbkodaListAttributes: common.dbkodaListAttributes,
  dbkodaListAttributes_parse: common.dbkodaListAttributes_parse,
  dbkodaMatchOperators: common.dbkodaMatchOperators,
  dbkodaMatchOperators_parse: common.dbkodaMatchOperators_parse
};
