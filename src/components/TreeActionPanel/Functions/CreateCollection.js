/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-09T13:25:50+10:00
 */

export const CreateCollection = {
  // Prefill function for alter user
  dbenvy_CreateCollectionPreFill: (params) => {
    const Database = params.Database;
    const data = {};
    data.Database = Database;
    data.CollectionName = 'New Collection name';
    data.capped = false;
    return data;
  },
  dbenvy_validationLevel: () => {
    return (['off', 'strict', 'moderate']);
  }
};
