/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T15:30:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-24T15:48:48+10:00
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
        result.ShardsPercentage = [];
        const shards = data[key];
        for (const shardKey in shards) {
          if (shards[shardKey]) {
            const shardInfo = shards[shardKey];
            const Shard = {name: shardKey};
            const ShardPct = {name: shardKey};
            if (shardInfo.size) {
              Shard.size = shardInfo.size;
              if (data.size) {
                ShardPct.value = Math.round((shardInfo.size / data.size) * 100);
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

    return result;
  }
};
