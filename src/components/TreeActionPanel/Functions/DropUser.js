/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T11:36:25+10:00
 */

export const DropUser = {
  // Prefill function for alter user
  dbenvy_DropUserPreFill: (userId) => {
    return `db.getSiblingDB("admin").system.users.find({"_id": "${userId}"}).toArray()`;
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
    return outputDoc;
  }
};
