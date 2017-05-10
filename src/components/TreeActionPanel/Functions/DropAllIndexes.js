/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T12:12:33+10:00
 */


export const DropAllIndexes = {
    executeCommand: null,
    setExecuteFunction: (cbFuncExecute) => {
        DropAllIndexes.executeCommand = cbFuncExecute;
    },
    // Prefill function for alter user
    dbenvy_DropAllIndexesPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        return data;
    },
    dbenvy_listcollections: () => {
        return 'db.getCollectionNames()';
    },
    dbenvy_listcollections_parse: (res) => {
        const collectionList = [];
        res.forEach((d) => {
            console.log('guy' + d);
            collectionList.push(d);
        });
        return collectionList;
    }
};
