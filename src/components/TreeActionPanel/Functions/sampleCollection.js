const dbe = {};

dbe.version = () => {
    return (db.version().split('.'));
};

dbe.majorVersion = () => {
    const version = dbe.version();
    const intversion = Number(version[0] + '.' + version[1]);
    return (intversion);
};

dbe.sampleCollection = (dbName, collectionName) => {
    let data = [];
    if (dbe.majorVersion > 3.0) {
        data = db.getSiblingDB(dbName).getCollection(collectionName)
            .aggregate([{
                $sample: {
                    size: 20
                }
            }]).toArray();
    } else {
        data = db.getSiblingDB(dbName).getCollection(collectionName)
            .find({}, {_id:0}).limit(20).toArray();
    }

    const attributes = {};
    data.forEach((doc) => {
        Object.keys(doc).forEach((key) => {
            let keytype = typeof doc[key];
            if (doc[key]) {
                if (doc[key].constructor === Array) {
                    keytype = 'array';
                }
            }
            attributes[key] = keytype;
            if (keytype == 'object') {
                const obj = doc[key];
                if (obj) {
                    Object.keys(obj).forEach((nestedKey) => {
                        attributes[key + '.' + nestedKey] = typeof obj[nestedKey];
                    });
                }
            } else
            if (keytype === 'array') {
                const docarray = doc[key];
                docarray.forEach((nestedDoc) => {
                    const obj = nestedDoc;
                    Object.keys(obj).forEach((nestedKey) => {
                        attributes[key + '.' + nestedKey] = typeof obj[nestedKey];
                    });
                });
            }
        });
    });
    const results = Object.keys(attributes);
    results.unshift('_id');
    // console.log('listAttributes returning ' + results.length);
    return results.sort();
};

dbe.version();
dbe.majorVersion();
dbe.sampleCollection('SampleCollections', 'Sakila_films');
