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
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-15T13:41:59+11:00
 */
/* eslint no-unused-vars:warn */

import * as common from './Common.js';
import { Aggregate } from './Aggregate';

// const sprintf = require('sprintf-js').sprintf;
const debug = false;

export const GroupBy = {
  executeCommand: null,
  setExecuteFunction: cbFuncExecute => {
    Aggregate.executeCommand = cbFuncExecute;
  },
  // Prefill function for alter user
  dbkoda_GroupByPreFill: params => {
    const data = {};
    data.Database = params.Database;
    data.CollectionName = params.CollectionName;
    data.InitialFilter = false;
    data.AggregateKeys = [
      {
        AttributeName: '_id',
        Aggregation: 'first'
      }
    ];
    data.Sort = true;
    data.SortKeys = [
      {
        AttributeName: '_id',
        Direction: 1
      }
    ];
    return data;
  },
  dbkodaAggOperators: () => {
    return 'db';
  },
  dbkodaAggOperators_parse: res => {
    return ['sum', 'max', 'min', 'avg', 'first', 'last'];
  },
  dbkoda_sortOptions: () => {
    return 'db';
  },
  dbkoda_sortOptions_parse: res => {
    return [1, -1];
  },
  dbkoda_listdb: common.dbkoda_listdb,
  dbkoda_listdb_parse: common.dbkoda_listdb_parse,
  dbkoda_listcollections: common.dbkoda_listcollections,
  dbkoda_listcollections_parse: common.dbkoda_listcollections_parse,
  dbkodaListAttributes: common.dbkodaListAttributes,
  dbkodaListAttributes_parse: common.dbkodaListAttributes_parse
};
