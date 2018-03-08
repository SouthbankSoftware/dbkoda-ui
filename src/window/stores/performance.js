/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-27T15:17:00+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-08T14:03:48+11:00
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
import { restore } from 'dumpenvy';
import { deserializer, postDeserializer } from '#/common/mobxDumpenvyExtension';
import { handleNewData } from '~/api/PerformancePanel';
import { attachToMobx } from '~/api/PerformancePanel';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Globalize = require('globalize'); // doesn't work well with import
// Globalize Configuration for Performance Window
global.Globalize = Globalize;
const { language, region } = Globalize.locale().attributes;
global.locale = `${language}-${region}`;
global.globalString = (path, ...params) => Globalize.messageFormatter(path)(...params);
global.globalNumber = (value, config) => Globalize.numberFormatter(config)(value);

export default class Store {
  config = null;
  @observable.shallow performancePanel = null;
  @observable profileId = null;

  toasterCallback = null;

  constructor() {
    ipcRenderer.on('performance', this.handleDataSync);
  }

  @action.bound
  handleDataSync = (event, args) => {
    if (args.command === 'mw_setProfileId') {
      this.profileId = args.profileId;
      this.sendCommandToMainProcess('pw_windowReady');
    } else {
      if (!this.profileId && args.profileId) {
        this.profileId = args.profileId;
      }
      if (this.profileId === args.profileId) {
        if (args.command === 'mw_initData') {
          this.config = restore(args.configObject, { deserializer, postDeserializer });
          this.performancePanel = restore(args.dataObject, { deserializer, postDeserializer });
          attachToMobx(this.performancePanel);
        } else if (args.command === 'mw_updateData' && this.performancePanel !== null) {
          const payload = args.dataObject;
          handleNewData(payload, this.performancePanel);
        } else if (args.command === 'mw_toaster') {
          console.log(args.toasterObj);
          if (this.toasterCallback) {
            this.toasterCallback(args.toasterObj);
          }
        }
      }
    }
  };

  @action.bound
  sendCommandToMainProcess = (command) => {
    ipcRenderer.send('performance', { command, profileId: this.profileId });
  };

  @action.bound
  resetHighWaterMark = () => {
    this.sendCommandToMainProcess('pw_resetHighWaterMark');
  };
}
