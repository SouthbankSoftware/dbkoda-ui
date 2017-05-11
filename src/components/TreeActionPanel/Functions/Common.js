/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-10T10:33:53+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T11:38:57+10:00
 */
const sprintf = require('sprintf-js').sprintf;

export function dbenvy_listdb(params) { //eslint-disable-line
    return 'db.adminCommand({listDatabases: 1})';
}
export function dbenvy_listdb_parse(res) { //eslint-disable-line
    const dblist = [];
    res.databases.forEach((d) => {
        dblist.push(d.name);
    });
    return dblist.sort();
}
export function dbenvy_listRoles(params) { //eslint-disable-line
    const db = (params && params.db) ? params.db : 'admin';
    return `db.getSiblingDB("${db}").getRoles({rolesInfo: 1, showPrivileges: false, showBuiltinRoles: true})`;
}
export function dbenvy_listRoles_parse(res) { //eslint-disable-line
    const roleList = [];
    res.forEach((r) => {
        roleList.push(r.role);
    });
    return roleList.sort();
}
export function dbenvy_listcollections(params) { //eslint-disable-line
    const cmd = 'db.getSiblingDB("' + params.db + '").getCollectionNames()';
    console.log(cmd);
    return cmd;
}

export function dbenvy_listcollections_parse(res) { //eslint-disable-line
    const collectionList = [];
    res.forEach((d) => {
        collectionList.push(d);
    });
    return collectionList.sort();
}

export function dbenvyListAttributes(params) {
    const tmpCollection = 'dbenvyTmp' + Math.floor(Math.random() * 10000000);
    let cmd = sprintf('db.getSiblingDB("%s").getCollection("%s").aggregate([{ $sample: {size: 20}},{$out:"%s"}]);',
        params.db, params.collection, tmpCollection);
    cmd += sprintf('var tmp=db.getSiblingDB("%s").%s.find({},{_id:0}).toArray();',
        params.db, tmpCollection);
    cmd += sprintf('db.getSiblingDB("%s").%s.drop();tmp;',
        params.db, tmpCollection);
    console.log(cmd);
    return cmd;
}

export function dbenvyListAttributes_parse(res) { //eslint-disable-line
    // Print attributes to one level (eg xxx.yyy but not xxx.yyy.zzz)
    // console.log(res);
    const attributes = {};
    res.forEach((doc) => {
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
    results.push('_id');
    // console.log('listAttributes returning ' + results.length);
    return results.sort();
}
