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

import { observable, runInAction } from 'mobx';
import yaml from 'js-yaml';
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';
import { Broker, EventType } from '../helpers/broker';

export default class Config {
  configFilePath;
  @observable configInit;
  @observable settings = {
    @observable mongoCmd: '',
    @observable drillCmd: ''
  };

  constructor() {
    this.configFilePath = global.PATHS.configPath;
    this.configInit = false;
    console.log(this.configFilePath);
    const handleConfigFileChange = () => {
      runInAction('Apply changes to config from yaml file', () => {
        this.load();
      });
    };
    const eventName = EventType.createFileChangedEvent(this.configFilePath);
    Broker.on(eventName, handleConfigFileChange);
  }

  load() {
    console.log('Load from config.yml');
    // Call controller file get service
    featherClient()
      .service('files')
      .get(this.configFilePath)
      .then((file) => {
        this.settings = yaml.safeLoad(file.content);
        this.configInit = true;
        console.log('Config loaded successfully!');
      })
      .catch((e) => {
        console.error(e);
        NewToaster.show({
          message: `Reading config.yml failed: ${e.message}`,
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down',
        });
      });
    // Read settings and apply to corresponding properties
  }

  save() {
    console.log('Save to config.yml');
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
        })
        .catch(console.error);
    } catch (e) {
      console.error(e);
      NewToaster.show({
        message: `Saving config.yml failed: ${e.message}`,
        intent: Intent.DANGER,
        iconName: 'pt-icon-thumbs-down',
      });
    }
  }
}
