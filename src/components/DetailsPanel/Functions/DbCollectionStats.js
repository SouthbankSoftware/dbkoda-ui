/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T15:30:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-23T13:26:55+10:00
 */
// const Globalize = require('globalize');
const sprintf = require('sprintf-js').sprintf;

export const DbCollectionStats = {
  // Prefill function for alter user
  dbcoda_DbCollectionStats: (params) => {
    return sprintf('dbeCR.collStats("%s")', params.dbName);
  },
  dbcoda_DbCollectionStats_parse: (data) => {
    // data.time = Globalize.formatNumber(data.time);
    // console.log(data.time);
    const result = {};
    result.top5 = [];
    result.CollectionDetails = data.collStats;
    data.collStats.forEach((cs) => {
      result.top5.push({
        ns:cs.ns,
        size:cs.storageSizeMB
      });
    result.top5.slice(0, 5);
    });
    return result;
  }
};
