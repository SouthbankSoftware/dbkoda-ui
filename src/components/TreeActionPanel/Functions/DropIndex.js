/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T11:36:25+10:00
 */

export const DropIndex = {
  // Prefill function for alter user
  dbenvy_DropIndexPreFill: (Database, CollectionName, IndexName) => {
    const outputDoc = {};
    outputDoc.Database = Database;
    outputDoc.CollectionName = CollectionName;
    outputDoc.IndexName = IndexName;
    return outputDoc;
  }
};
