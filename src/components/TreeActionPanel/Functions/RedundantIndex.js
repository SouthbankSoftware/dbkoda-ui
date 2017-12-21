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

const firstElements = (object, N) => {
  // First Elements in array
  const output = {};
  let n = 0;
  Object
    .keys(object)
    .forEach((key) => {
      if (n++ < N) {
        output[key] = object[key];
      }
    });
  return output;
};

export const RedundantIndex = {
  // Prefill function for alter user
  dbkoda_DropUnecessaryPreFill: (params) => {
    const db = params.Database;
    const collection = params.CollectionName;
    return `db.getSiblingDB("${db}").getCollection("${collection}").getIndexes()`;
  },
  dbkoda_DropUnecessaryPreFill_parse: (existingIndexes) => {
    console.log(existingIndexes);
    const ns = existingIndexes[0].ns;
    const dbName = ns.split('.')[0];
    const collectionName = ns.split('.')[1];
   const redundantIndexes = [];
    existingIndexes.forEach((index1) => {
      existingIndexes.some((index2) => {
          if (index1.name !== index2.name) {
            const existingLen = Object.keys(index1.key).length;  // eslint-disable-line
            const matchKeys = firstElements(index2.key, existingLen);
            if (JSON.stringify(matchKeys) === JSON.stringify(index1.key)) {
              redundantIndexes.push({
                IndexName: index1.name,
                Reason: 'Index ' + index1.name + '(' + JSON.stringify(index1.key) +
                ' is covered by ' + index2.name + '(' +
                JSON.stringify(index2.key) + ')'
              });
              return true;
            }
          }
        });
    });
    const outputDoc = {};
    outputDoc.Database = dbName;
    outputDoc.CollectionName = collectionName;
    outputDoc.UnecessaryIndexes = redundantIndexes;
    return outputDoc;
  }
};
