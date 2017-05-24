/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T15:30:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-23T13:26:55+10:00
 */

export const CollectionStats = {
  // Prefill function for alter user
  dbenvy_CollectionStats: (params) => {
    const colId = params.ColId;
    const parentDb = params.parentDB;
    return `db.getSiblingDB("${parentDb}").${colId}.stats()`;
  },
  dbenvy_CollectionStats_parse: (data) => {
    console.log(data);

    const result = {};
    result.Statistics = [];
    for (const key in data) {
      if (data[key] && typeof data[key] != 'object') {
        result.Statistics.push({statistic: key, value: data[key]});
      }
    }
    return result;
  }
};
