/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-08T12:38:34+10:00
 */

export const AlterUser = {
  // Prefill function for alter user
  dbenvy_AlterUserPreFill: (params) => {
    const userId = params.UserId;
    const parentDb = params.parentDB;
    return `db.getSiblingDB("admin").system.users.find({"_id": "${parentDb}.${userId}"}).toArray()`;
  },
  dbenvy_AlterUserPreFill_parse: (userDocs) => {
    console.log(userDocs);
    if (userDocs.length == 0) {
      throw new Error('No user found for Alter User');
    } else if (userDocs.length > 1) {
      throw new Error('dbenvy: Too many users found for Alter User');
    }
    const userDoc = userDocs[0];
    const outputDoc = {};
    outputDoc.UserId = userDoc._id;
    outputDoc.Database = userDoc.db;
    outputDoc.UserName = userDoc.user;
    // outputDoc.CustomData = userDoc.customData;
    outputDoc.Roles = [];
    userDoc.roles.forEach((role) => {
      outputDoc.Roles.push({
        Database: role.db,
        Role: role.role,
      });
    });

    return outputDoc;
  },
  dbenvy_validateUser: (inputDoc) => {
    if (Object.prototype.hasOwnProperty.call(inputDoc, 'Roles') && inputDoc.Roles.length > 0) {
      return true;
    }
    throw new Error('dbenvy: Alter user should include as least one role');
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
