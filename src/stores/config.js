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
 *
 * @Author: Chris Trott <christrott>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-10-03T15:35:19+11:00
 */

import { action, observable, runInAction } from 'mobx';
import yaml from 'js-yaml';
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';
import { Broker, EventType } from '../helpers/broker';

export default class Config {
  configFilePath;
  @observable loading;
  @observable
  settings = {
    @observable mongoCmd: '',
    @observable drillCmd: '',
    @observable telemetryEnabled: null,
    @observable showWelcomePageAtStart: true,
  };

  constructor() {
    if (global.PATHS) {
      this.configFilePath = global.PATHS.configPath;
    }
    this.loading = false;

    const handleConfigFileChange = () => {
      this.load();
    };
    const eventName = EventType.createFileChangedEvent(this.configFilePath);
    Broker.on(eventName, handleConfigFileChange);
  }

  setDefaults() {
    this.settings.telemetryEnabled = true;
    this.settings.showWelcomePageAtStart = true;
    // NOTE: Don't change paths, that's just super annoying
  }

  @action.bound
  load() {
    console.log('Load from config.yml');
    if (!this.configFilePath) {
      return;
    }
    // Call controller file get service
    featherClient()
      .service('files')
      .get(this.configFilePath)
      .then((file) => {
        runInAction('Apply changes to config from yaml file', () => {
          this.settings = yaml.safeLoad(file.content);
          if (this.loading) {
            runInAction(() => {
              this.loading = false;
            });
          }
          console.log('Config loaded successfully!');
        });
      })
      .catch((e) => {
        console.error(e);
        NewToaster.show({
          message: `Reading config.yml failed: ${e.message}`,
          className: 'danger',
          iconName: 'pt-icon-thumbs-down',
        });
      });
  }

  @action.bound
  save() {
    this.loading = true;
    console.log('Save to config.yml');
    if (!this.configFilePath) {
      return;
    }
    try {
      return featherClient()
        .service('files')
        .create({
          _id: this.configFilePath,
          content: yaml.safeDump(this.settings),
          watching: false,
        })
        .then(() => {
          console.log('config.yml updated');
          NewToaster.show({
            message: 'Config.yml successfully updated',
            className: 'success',
            iconName: 'pt-icon-thumbs-up',
          });
          runInAction(() => {
            this.loading = false;
          });
        })
        .catch(console.error);
    } catch (e) {
      console.error(e);
      NewToaster.show({
        message: `Saving config.yml failed: ${e.message}`,
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
      });
    }
  }
}
