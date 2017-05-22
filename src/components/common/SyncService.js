/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T09:14:04+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-22T10:56:56+10:00
 */


import EJSON from 'mongodb-extended-json';
import { featherClient } from '~/helpers/feathers';

 export const SyncService = {
   executeQuery: (query, shellId, profileId) => {
     console.log('Query:', query);
     if (shellId && profileId && shellId != '' && profileId != '') {
       const service = featherClient().service('/mongo-sync-execution');
       service.timeout = 30000;
       return new Promise((resolve, reject) => {
         service
           .update(profileId, {
             shellId,
             commands: query
           })
           .then((res) => {
             if (typeof res == 'string') {
               res = res.replace(/[\r\n\t]*/g, '');
               console.log('Result: ', res);
               res = res.replace(/ObjectId\((\"\w*\")\)/g, '$1');
               try {
                 const ejson = EJSON.parse(res);
                 resolve(ejson);
               } catch (e) {
                 console.log(e);
                 resolve({});
               }
             } else {
               resolve(res);
             }
           })
           .catch((reason) => {
             console.log(
               'executeCommand:',
               'Handle rejected promise (' + reason + ') here.'
             );
             reject(reason);
           });
       });
     }
     return null;
   }
 };
