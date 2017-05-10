/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T11:36:25+10:00
 */
import * as common from './Common.js';

export const DropUser = {
    // Prefill function for alter user
    dbenvy_DropUserPreFill: (params) => {
        const userId = params.UserId;
        const parentDb = params.parentDB;
        return `db.getSiblingDB("admin").system.users.find({"_id": "${parentDb}.${userId}"}).toArray()`;
    },
    dbenvy_DropUserPreFill_parse: (userDocs) => {
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
    dbenvy_listdb: common.dbenvy_listdb,
    dbenvy_listdb_parse: common.dbenvy_listdb_parse,
    dbenvy_listcollections: common.dbenvy_listcollections,
    dbenvy_listcollections_parse: common.dbenvy_listcollections_parse
};
