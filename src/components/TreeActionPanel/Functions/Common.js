/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-10T10:33:53+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T21:43:08+10:00
 */

const sprintf = require('sprintf-js').sprintf;

export function dbkoda_listdb(params) { //eslint-disable-line
    return 'db.adminCommand({listDatabases: 1})';
}
export function dbkoda_listdb_parse(res) { //eslint-disable-line
    const dblist = [];
    res.databases.forEach((d) => {
        dblist.push(d.name);
    });
    return dblist.sort();
}
export function dbkoda_listRoles(params) { //eslint-disable-line
    const db = (params && params.db) ? params.db : 'admin';
    return `db.getSiblingDB("${db}").getRoles({rolesInfo: 1, showPrivileges: false, showBuiltinRoles: true})`;
}
export function dbkoda_listRoles_parse(res) { //eslint-disable-line
    const roleList = [];
    res.forEach((r) => {
        roleList.push(r.role);
    });
    return roleList.sort();
}
export function dbkoda_listcollections(params) { //eslint-disable-line
    const cmd = 'db.getSiblingDB("' + params.db + '").getCollectionNames()';
    console.log(cmd);
    return cmd;
}

export function dbkoda_listcollections_parse(res) { //eslint-disable-line
    const collectionList = [];
    res.forEach((d) => {
        collectionList.push(d);
    });
    return collectionList.sort();
}
export function dbkodaParameterList() { //eslint-disable-line
    return ('JSON.stringify(db.getSiblingDB("admin").runCommand( { getParameter : "*" }))');
}
export function dbkodaParameterList_parse(res) {//eslint-disable-line
    console.log('got parameters', res);
    const params = Object.keys(res);
    console.log(params);
    return params;
}
export function dbkodaListAttributes(params) {
    const cmd = sprintf('dbe.sampleCollection("%s","%s");', params.db, params.collection);
    console.log(cmd);
    return cmd;
}

export function dbkodaListAttributes_parse(res) { //eslint-disable-line
    const data = [];
    console.log('got attributes', res);
    res.forEach((a) => {
        data.push(a);
    });
    return data;
}
