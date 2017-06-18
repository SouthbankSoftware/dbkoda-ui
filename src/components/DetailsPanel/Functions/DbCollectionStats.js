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
  dbkoda_DbCollectionStats: (params) => {
    return sprintf('dbeCR.collStats("%s")', params.dbName);
  },
  dbkoda_DbCollectionStats_parse: (data) => {
    // data.time = Globalize.formatNumber(data.time);
    // console.log(data.time);
    const result = {};
    result.top10 = [];
    result.CollectionDetails = data.collStats;
    data.collStats.forEach((cs) => {
      result.top10.push({
        ns:cs.ns,
        size:cs.storageSizeMB
      });
    result.top10 = result.top10.slice(0, 10);
    });
    return result;
  }
};
