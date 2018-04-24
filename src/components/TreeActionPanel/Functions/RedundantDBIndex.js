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
 * @Last modified time: 2017-05-10T12:27:05+10:00
 */
/* eslint no-unused-vars:warn */
/* eslint no-plusplus:warn */

import * as common from './Common.js';

export const RedundantDBIndex = {
  // Prefill function for alter user
  dbkoda_RedundantDBPreFill: params => {
    const db = params.Database;
    const cmd = `dbkInx.redundantDbIndexes("${db}");`;
    console.log(cmd);
    return cmd;
  },
  dbkoda_RedundantDBPreFill_parse: indexList => {
    console.log(indexList);
    const output = {};
    output.UnecessaryIndexes = [];
    indexList.forEach(r => {
      output.UnecessaryIndexes.push({
        dbName: r.dbName,
        collection: r.collection,
        indexName: r.indexName,
        key: r.key,
        becauseIndex: r.becauseIndex,
        becauseKeys: r.becauseKeys
      });
    });
    console.log(output);
    return output;
  }
};
