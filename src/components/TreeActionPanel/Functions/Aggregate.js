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
    dbkoda_AggregatePreFill: (params) => {
        return sprintf('dbe.aggregationPreFill("%s","%s")', params.Database, params.CollectionName);
    },
    dbkoda_AggregatePreFill_parse: (res) => {
        res.InitialFilter = false;
        return (res);
    },
    dbkoda_sortOptions: () => {
        return ('db');
    },
    dbkoda_sortOptions_parse: (res) => {
        console.log(res);
        return ([1, -1]);
    },
    dbkodaAggSteps: () => {
        return ('dbe.aggregationArgs()');
    },
    dbkodaAggSteps_parse: (res) => {
        const data = [];
        res.forEach((r) => {
            data.push(r.StepName);
        });
        return (data);
    },
    dbkoda_listdb: common.dbkoda_listdb,
    dbkoda_listdb_parse: common.dbkoda_listdb_parse,
    dbkoda_listcollections: common.dbkoda_listcollections,
    dbkoda_listcollections_parse: common.dbkoda_listcollections_parse,
    dbkodaListAttributes: common.dbkodaListAttributes,
    dbkodaListAttributes_parse: common.dbkodaListAttributes_parse
};
