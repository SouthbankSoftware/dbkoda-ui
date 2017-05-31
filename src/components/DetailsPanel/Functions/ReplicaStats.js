/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T15:30:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-23T13:26:55+10:00
 */

export const ReplicaStats = {
  // Prefill function for alter user
  dbcoda_ReplicaStats: () => {
    return 'dbc_rsStats.details()';
  },
  dbcoda_ReplicaStats_parse: (data) => {
    return data;
  }
};
