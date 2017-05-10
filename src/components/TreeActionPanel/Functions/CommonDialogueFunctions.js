export const CommonDialogueFunctions = {
    dbenvy_CreateIndexPreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        data.CollectionName = params.CollectionName;
        data.Unique = 'false';
        data.Background = 'false';
        data.Sparse = 'false';
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
    },
};
