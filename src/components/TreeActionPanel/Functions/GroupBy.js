/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T12:12:33+10:00
 */

import * as common from './Common.js';

// const sprintf = require('sprintf-js').sprintf;
const debug = false;

export const GroupBy = {
    executeCommand: null,
    setExecuteFunction: (cbFuncExecute) => {
        Aggregate.executeCommand = cbFuncExecute;
    },
    // Prefill function for alter user
    dbenvy_GroupByPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        data.InitialFilter = false;
        data.AggregateKeys = [{
            AttributeName: '_id',
            Aggregation: 'first'
        }];
        data.Sort = true;
        data.SortKeys = [{
            AttributeName: '_id',
            Direction: 1
        }];
        return data;
    },
    dbenvyAggOperators: () => {
        return ('db');
    },
    dbenvyAggOperators_parse: (res) => {
        if (debug) console.log(res);
        return (['sum', 'max', 'min', 'avg', 'first', 'last']);
    },
    dbenvy_sortOptions: () => {
        return ('db');
    },
    dbenvy_sortOptions_parse: (res) => {
        console.log(res);
        return ([1, -1]);
    },
    dbenvy_listdb: common.dbenvy_listdb,
    dbenvy_listdb_parse: common.dbenvy_listdb_parse,
    dbenvy_listcollections: common.dbenvy_listcollections,
    dbenvy_listcollections_parse: common.dbenvy_listcollections_parse,
    dbenvyListAttributes: common.dbenvyListAttributes,
    dbenvyListAttributes_parse: common.dbenvyListAttributes_parse
};
