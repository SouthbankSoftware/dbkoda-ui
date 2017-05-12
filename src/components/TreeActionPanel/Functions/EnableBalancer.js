/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T10:45:15+10:00
 */

// import * as common from './Common.js';
// const sprintf = require('sprintf-js').sprintf;

export const EnableBalancer = {
    // Prefill function for alter user
    dbenvy_EnableBalancerPreFill: () => {
        const cmd = 'sh.getBalancerState()';
        return cmd;
    },
    dbenvy_EnableBalancerPreFill_parse: (res) => {
        const outputDoc = {};
        if (res === true) {
            outputDoc.BalancerState = res;
        } else {
            outputDoc.BalancerState = false;
        }
        return outputDoc;
    }
};
