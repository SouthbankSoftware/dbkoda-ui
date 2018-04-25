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
 * @Date:   2017-05-22T15:30:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-04T11:35:27+10:00
 */

export const CollectionStats = {
  // Prefill function for alter user
  dbkoda_CollectionStats: params => {
    const colId = params.ColId;
    const parentDb = params.parentDB;
    return `db.getSiblingDB("${parentDb}").${colId}.stats(1024)`;
  },
  dbkoda_CollectionStats_parse: data => {
    const result = {};
    result.Statistics = [];
    for (const key in data) {
      if ({}.hasOwnProperty.call(data, key)) {
        if (typeof data[key] != 'object') {
          result.Statistics.push({ statistic: key, value: data[key] + '' });
        }
        if (key == 'shards') {
          result.Shards = [];
          result.ShardsPercentage = [];
          const shards = data[key];
          for (const shardKey in shards) {
            if (shards[shardKey]) {
              const shardInfo = shards[shardKey];
              const Shard = { name: shardKey };
              const ShardPct = { name: shardKey };
              if (shardInfo.size) {
                Shard.size = shardInfo.size;
                if (data.size) {
                  ShardPct.value = Math.round(shardInfo.size / data.size * 100);
                }
              }
              if (shardInfo.count) {
                Shard.count = shardInfo.count;
              }
              result.Shards.push(Shard);
              result.ShardsPercentage.push(ShardPct);
            }
          }
        }
      }
    }

    return result;
  }
};
