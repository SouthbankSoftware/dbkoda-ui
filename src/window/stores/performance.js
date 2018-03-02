/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-27T15:17:00+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-02T11:06:32+11:00
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

import _ from 'lodash';
import { observable, action } from 'mobx';
import { restore } from 'dumpenvy';

import {
  deserializer,
  postDeserializer
} from '#/common/mobxDumpenvyExtension';

const electron = window.require('electron');

const { ipcRenderer } = electron;
const MAX_HISTORY_SIZE = 720; // 1h with 5s sampling rate

const Globalize = require('globalize'); // doesn't work well with import

global.Globalize = Globalize;

const { language, region } = Globalize.locale().attributes;

global.locale = `${language}-${region}`;

global.globalString = (path, ...params) => Globalize.messageFormatter(path)(...params);
global.globalNumber = (value, config) => Globalize.numberFormatter(config)(value);

export default class Store {
  @observable performancePanel = null;
  @observable profileId = null;

  @action.bound
  syncPayload(performancePanel, payload) {
    const { widgets } = performancePanel;
    const { timestamp, value: rawValue, stats } = payload;

    performancePanel.stats = stats;

    for (const widget of widgets.values()) {
      const { items, values, showAlarms } = widget;

      if (values.length >= MAX_HISTORY_SIZE) {
        values.splice(0, MAX_HISTORY_SIZE - values.length + 1);
      }

      const value = {
        timestamp,
        value: _.pick(rawValue, items),
        stats: _.pick(stats, items)
      };

      if (showAlarms) {
        const alarmObj = _.get(rawValue, `alarm.${showAlarms}`);

        if (alarmObj) {
          // $FlowFixMe
          value.alarms = _.orderBy(
            _.map(alarmObj, v => {
              const alarm = _.pick(v, ['level', 'message']);
              alarm.timestamp = timestamp;
              return alarm;
            }),
            ['timestamp'],
            ['desc']
          );
        }
      }

      values.push(value);
    }
  }
  @action.bound
  handleDataSync = (event, args) => {
    console.log(args);
    if (args.command === 'mw_setProfileId') {
      this.profileId = args.profileId;
      ipcRenderer.send('performance', {command: 'pw_windowReady', profileId: this.profileId});
    } else if (args.profileId) {
      if (!this.profileId) {
        this.profileId = args.profileId;
      }
      if (this.profileId === args.profileId) {
        if (args.command === 'mw_initData') {
          this.performancePanel = restore(args.dataObject, { deserializer, postDeserializer });
          console.log('this.performancePanel::', this.performancePanel);
        } else if (args.command === 'mw_updateData' && this.performancePanel !== null) {
          const payload = args.dataObject;
          this.syncPayload(this.performancePanel, payload);
        }
      }
    }
  };
  constructor() {
    ipcRenderer.on('performance', this.handleDataSync);
  }
}
