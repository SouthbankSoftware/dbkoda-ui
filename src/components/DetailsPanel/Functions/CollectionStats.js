/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T15:30:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-24T12:32:37+10:00
 */

export const CollectionStats = {
  // Prefill function for alter user
  dbenvy_CollectionStats: (params) => {
    const colId = params.ColId;
    const parentDb = params.parentDB;
    return `db.getSiblingDB("${parentDb}").${colId}.stats(1024)`;
  },
  dbenvy_CollectionStats_parse: (data) => {
    console.log(data);

    const result = {};
    result.Statistics = [];
    for (const key in data) {
      if ({}.hasOwnProperty.call(data, key) && typeof data[key] != 'object') {
        result.Statistics.push({statistic: key, value: (data[key] + '')});
      }
      if (data[key] && key == 'shards') {
        result.Shards = [];
        const shards = data[key];
        for (const shardKey in shards) {
          if (shards[shardKey]) {
            const shardInfo = shards[shardKey];
            const Shard = {name: shardKey};
            if (shardInfo.size) {
              Shard.size = shardInfo.size;
              if (data.size) {
                Shard.pctSize = Math.round((shardInfo.size / data.size) * 100);
              }
            }
            result.Shards.push(Shard);
          }
        }
      }
    }

    return result;
  }
};
