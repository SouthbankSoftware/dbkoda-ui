/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T15:30:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-23T13:26:55+10:00
 */
// const Globalize = require('globalize');

export const CurrentOps = {
  // Prefill function for alter user
  dbkoda_CurrentOps: () => {
    return 'dbeOps.printCurrentOps(true,true)';
  },
  dbkoda_CurrentOps_parse: (data) => {
    // data.time = Globalize.formatNumber(data.time);
    // console.log(data.time);
    return data;
  }
};
