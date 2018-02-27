/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-27T15:17:00+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-27T17:01:08+11:00
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

import { observable, action } from 'mobx';

const electron = window.require('electron');

const { ipcRenderer } = electron;

export default class Store {
  @observable performancePanel = null;
  @observable profileId = null;

  @action.bound
  syncObject(dataObject, syncObject, path) {
    console.log(path);
    console.log(dataObject);
    console.log(syncObject);
  }
  @action.bound
  handleDataSync = (event, args) => {
    if (args.profileId) {
      if (!this.profileId) {
        this.profileId = args.profileId;
      }
      if (this.profileId === args.profileId) {
        if (args.command === 'initObject') {
          this.performancePanel = args.dataObject;
        } else if (args.command === 'syncObject' && this.performancePanel !== null) {
          this.syncObject(this.performancePanel, args.dataObject, args.path);
        }
      }
    }
  };
  constructor() {
    ipcRenderer.on('dataSync', this.handleDataSync);
  }
}
