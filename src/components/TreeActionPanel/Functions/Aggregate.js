/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T12:12:33+10:00
 */

import * as common from './Common.js';

const sprintf = require('sprintf-js').sprintf;

export const Aggregate = {
    executeCommand: null,
    setExecuteFunction: (cbFuncExecute) => {
        Aggregate.executeCommand = cbFuncExecute;
    },
    // Prefill function for alter user
    dbenvy_AggregatePreFill: (params) => {
        return sprintf('dbe.aggregationPreFill("%s","%s")', params.Database, params.CollectionName);
    },
    dbenvy_AggregatePreFill_parse: (res) => {
        res.InitialFilter = false;
        return (res);
    },
    dbenvy_sortOptions: () => {
        return ('db');
    },
    dbenvy_sortOptions_parse: (res) => {
        console.log(res);
        return ([1, -1]);
    },
    dbenvyAggSteps: () => {
        return ('dbe.aggregationArgs()');
    },
    dbenvyAggSteps_parse: (res) => {
        const data = [];
        res.forEach((r) => {
            data.push(r.StepName);
        });
        return (data);
    },
    dbenvy_listdb: common.dbenvy_listdb,
    dbenvy_listdb_parse: common.dbenvy_listdb_parse,
    dbenvy_listcollections: common.dbenvy_listcollections,
    dbenvy_listcollections_parse: common.dbenvy_listcollections_parse,
    dbenvyListAttributes: common.dbenvyListAttributes,
    dbenvyListAttributes_parse: common.dbenvyListAttributes_parse
};
