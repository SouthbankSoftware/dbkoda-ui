/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T09:14:04+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-23T14:09:37+10:00
 */

import { featherClient } from '~/helpers/feathers';

export const SyncService = {
  executeQuery: (query, shellId, profileId) => {
    if (shellId && profileId && shellId != '' && profileId != '') {
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 60000;
      return new Promise((resolve, reject) => {
        service
          .update(profileId, {
            shellId,
            commands: query
          })
          .then(res => {
            if (typeof res == 'string') {
              res = res.replace(/[\r\n\t]*/g, '');
              res = res.replace(/ObjectId\((\"\w*\")\)/g, '$1');
              res = res.replace(/(BinData\(\d*?\W)(\")(.*?)(\")(\))/g, '"$1\\$2$3\\$4$5"');
              res = res.replace(/NumberLong\(\"?(\d*)\"?\)/g, '$1');
              res = res.replace(/NumberDecimal\(\"?(\d*)\"?\)/g, '$1');
              res = res.replace(/Timestamp\((\d*)[\w|\W]*?\)/g, '$1');
              res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
              res = res.replace(/\bNaN\b/g, '"NaN"');
              try {
                const ejson = JSON.parse(res);
                l.debug('!!! - ', ejson);
                resolve(ejson);
              } catch (e) {
                l.debug('Failed to parse JSON coming rom SyncSerivce, String below.');
                l.debug(res);
                resolve(res);
              }
            } else {
              resolve(res);
            }
          })
          .catch(reason => {
            reject(reason);
          });
      });
    }
    return null;
  }
};
