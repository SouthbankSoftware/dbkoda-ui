/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-18T16:45:28+10:00
 */

export const AlterUser = {
  executeCommand: null,
  setExecuteFunction: (cbFuncExecute) => {
    CreateUser.executeCommand = cbFuncExecute;
  },
  // Prefill function for alter user
  dbenvy_AlterUserPreFill: () => {
    const data = {};
    data.Database = 'test';
    data.roles = [];
    data.roles.push({Role:'read', Database:'test'});
    return data;
  },
  dbenvy_validateUser: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Roles')) {
      throw new Error('dbenvy: Alter user should include as least one role');
    }
  },

  dbenvy_listdb: () => {
    const data = new Promise((resolve, reject) => {
      AlterUser.executeCommand(
        'db.adminCommand({listDatabases: 1})',
      ).then((res) => {
        const dblist = [];
        res.databases.forEach((d) => {
          dblist.push(d.name);
        });
        resolve(dblist);
      }).catch((reason) => {
        reject(reason);
      });
    });
    return data;
  },
  dbenvy_listRoles: () => {
    const data = new Promise((resolve, reject) => {
      AlterUser.executeCommand(
        'db.getSiblingDB("admin").getRoles({rolesInfo: 1, showPrivileges: false, showBuiltinRoles: true})',
      ).then((res) => {
        const roleList = [];
        res.forEach((r) => {
          roleList.push(r.role);
        });
        resolve(roleList);
      }).catch((reason) => {
        reject(reason);
      });
    });
    return data;
  },
};
