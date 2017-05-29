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
    dbcoda_AggregatePreFill: (params) => {
        return sprintf('dbe.aggregationPreFill("%s","%s")', params.Database, params.CollectionName);
    },
    dbcoda_AggregatePreFill_parse: (res) => {
        res.InitialFilter = false;
        return (res);
    },
    dbcoda_sortOptions: () => {
        return ('db');
    },
    dbcoda_sortOptions_parse: (res) => {
        console.log(res);
        return ([1, -1]);
    },
    dbcodaAggSteps: () => {
        return ('dbe.aggregationArgs()');
    },
    dbcodaAggSteps_parse: (res) => {
        const data = [];
        res.forEach((r) => {
            data.push(r.StepName);
        });
        return (data);
    },
    dbcoda_listdb: common.dbcoda_listdb,
    dbcoda_listdb_parse: common.dbcoda_listdb_parse,
    dbcoda_listcollections: common.dbcoda_listcollections,
    dbcoda_listcollections_parse: common.dbcoda_listcollections_parse,
    dbcodaListAttributes: common.dbcodaListAttributes,
    dbcodaListAttributes_parse: common.dbcodaListAttributes_parse
};
