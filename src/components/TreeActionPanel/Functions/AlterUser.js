/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-06T16:46:26+10:00
 */

export const AlterUser = {
  executeCommand: null,
  setExecuteFunction: (cbFuncExecute) => {
    AlterUser.executeCommand = cbFuncExecute;
  },
  // Prefill function for alter user
  Prefill: (userId) => {
    const userDocs = AlterUser.executeCommand(
      `db.getSiblingDB("admin").system.users.find({
        "_id": userId
    }).toArray()`,
    );

    if (userDocs.length == 0) {
      throw new Error(Localisation.string.error1.part1 + userId + ' found for Alter User');
    } else if (userDocs.length > 1) {
      throw new Error('dbenvy: Too many users found for Alter User');
    }
    const userDoc = userDocs[0];
    const outputDoc = {};
    outputDoc.UserId = userDoc._id;
    outputDoc.Database = userDoc.db;
    outputDoc.UserName = userDoc.user;
    outputDoc.CustomData = userDoc.customData;
    outputDoc.Roles = [];
    userDoc.roles.forEach((role) => {
      outputDoc.Roles.push({
        Role: role.role,
        Database: role.db,
      });
    });

    return outputDoc;
  },
  Validate: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Roles')) {
      throw new Error('dbenvy: Alter user should include as least one role');
    }
  },

  getListDB: () => {
    const dblist = [];
    AlterUser.executeCommand(
      `db.adminCommand({
            listDatabases: 1
        })`,
    ).databases.forEach((d) => {
      dblist.push(d.name);
    });
    return dblist;
  },
  getListRoles: () => {
    const roleList = [];
    AlterUser.executeCommand(
      `db.getSiblingDB("admin")
        .getRoles({
            rolesInfo: 1,
            showPrivileges: true,
            showBuiltinRoles: true
        })`,
    ).forEach((r) => {
      roleList.push(r.role);
    });
    return roleList;
  },
};
