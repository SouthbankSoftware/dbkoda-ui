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

export const DatabaseStorage = {
  // Prefill function for alter user
  dbkoda_DatabaseStorage: () => {
    return 'dbe.databaseStorage()';
  },
  dbkoda_DatabaseStorage_parse: (data) => {
    const result = {};
    const sbdb = []; // tmp store for db storage
    result.shardMap = [];
    data
      .storageByDb
      .forEach((d) => {
        sbdb.push({
          name: d.name,
          sizeOnDisk: (d.sizeOnDisk / 1048576)
        });
      });
    result.storageByDb = sbdb.sort((a, b) => {
      return (b.sizeOnDisk - a.sizeOnDisk);
    }).slice(0, 10);
    Object
      .keys(data.shardData)
      .forEach((shard) => {
        result
          .shardMap
          .push({
            shardName: shard,
            size: data.shardData[shard] / 1048576
          });
      });
    console.log(result);
    return result;
  }
};
