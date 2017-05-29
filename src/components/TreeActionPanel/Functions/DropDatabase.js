/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T10:45:15+10:00
 */

// import * as common from './Common.js';

export const DropDatabase = {
    // Prefill function for alter user
    dbcoda_DropDatabasePreFill: (params) => {
        const data = {};
        data.Database = params.Database;
        return (data);
    }
};

