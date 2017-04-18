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
    AlterUser.executeCommand = cbFuncExecute;
  },
  // Prefill function for alter user
  dbenvy_AlterUserPreFill: (userId) => {
    const data = new Promise((resolve, reject) => {
      const promise = AlterUser.executeCommand(
        `db.getSiblingDB("admin").system.users.find({"_id": "${userId}"}).toArray()`,
      );
      if (promise) {
        promise
          .then((userDocs) => {
            console.log(userDocs);
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
            // outputDoc.CustomData = userDoc.customData;
            outputDoc.Roles = [];
            userDoc.roles.forEach((role) => {
              outputDoc.Roles.push({
                Role: role.role,
                Database: role.db,
              });
            });

            resolve(outputDoc);
          })
          .catch(
            // Log the rejection reason
            (reason) => {
              console.log('Handle rejected promise (' + reason + ') here.');
              reject(reason);
            },
          );
      } else {
        reject(' Some error with the executing command. ');
      }
    });
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
