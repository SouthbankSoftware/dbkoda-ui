/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-09T10:24:13+10:00
 */

export const CreateUser = {
  // Prefill function for alter user
  dbenvy_CreateUserPreFill: () => {
    const data = {};
    data.Database = 'test';
    data.Roles = [];
    data.Roles.push({ Database:'test', Role:'read'});
    return data;
  },
  dbenvy_validateUser: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Roles')) {
      throw new Error('dbenvy: Alter user should include as least one role');
    }
    return true;
  },
  dbenvy_listdb: () => {
    return 'db.adminCommand({listDatabases: 1})';
  },
  dbenvy_listdb_parse: (res) => {
    const dblist = [];
    res.databases.forEach((d) => {
      dblist.push(d.name);
    });
    return dblist;
  },
  dbenvy_listRoles: () => {
    return 'db.getSiblingDB("admin").getRoles({rolesInfo: 1, showPrivileges: false, showBuiltinRoles: true})';
  },
  dbenvy_listRoles_parse: (res) => {
    const roleList = [];
    res.forEach((r) => {
      roleList.push(r.role);
    });
    return roleList;
  }
};
