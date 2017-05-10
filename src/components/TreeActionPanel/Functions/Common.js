/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-10T10:33:53+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T11:38:57+10:00
 */

export function dbenvy_listdb(params) {                 //eslint-disable-line
  return 'db.adminCommand({listDatabases: 1})';
}
export function dbenvy_listdb_parse(res) {        //eslint-disable-line
  const dblist = [];
  res.databases.forEach((d) => {
    dblist.push(d.name);
  });
  return dblist;
}
export function dbenvy_listRoles(params) {              //eslint-disable-line
  const db = (params && params.db) ? params.db : 'admin';
  return `db.getSiblingDB("${db}").getRoles({rolesInfo: 1, showPrivileges: false, showBuiltinRoles: true})`;
}
export function dbenvy_listRoles_parse(res) {     //eslint-disable-line
  const roleList = [];
  res.forEach((r) => {
    roleList.push(r.role);
  });
  return roleList;
}
