/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-05-08T15:01:20+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-08T16:38:41+10:00
 *
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

import { SyncService } from '#/common/SyncService';

export default class StorageDrilldownApi {
  store: *;
  api: *;

  constructor(store: *, api: *) {
    this.store = store;
    this.api = api;
  }

  getStorageData(profileId, shellId) {
    return SyncService.executeQuery('dbe.storageAnalysis()', shellId, profileId);
  }
  getChildStorageData(profileId, shellId, db, col) {
    return SyncService.executeQuery(
      'dbe.collectionStorageAnalysis("' + db + '", "' + col + '" , 1000)',
      shellId,
      profileId
    );
  }
}
