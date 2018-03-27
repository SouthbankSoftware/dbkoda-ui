/**
 * @Author: Chris Trott <christrott>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-16T15:53:32+11:00
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

import { action, observable, runInAction, toJS } from 'mobx';
import yaml from 'js-yaml';
import _ from 'lodash';
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';

export default class Profiles {
  saveDebounced = _.debounce(this.save, 500);
  profilesFilePath;
  @observable profiles = observable.map();

  constructor() {
    if (global.PATHS) {
      this.profilesFilePath = global.PATHS.profilesPath;
    }
  }

  sanitize(profilesList) {
    for (const profile in profilesList) {
      if (Object.prototype.hasOwnProperty.call(profilesList, profile)) {
        profilesList[profile].status = 'CLOSED';
      }
    }
    return profilesList;
  }

  @action.bound
  load() {
    if (!this.profilesFilePath) {
      return;
    }
    this.loading = true;
    // Call controller file get service
    return featherClient()
      .service('files')
      .get(this.profilesFilePath)
      .then(file => {
        runInAction('Apply changes to profiles from yaml file', () => {
          const profileLoad = yaml.safeLoad(file.content);
          if (profileLoad) {
            this.profiles = observable.map(profileLoad);
          }
          this.profiles.observe(this.saveDebounced);
          if (this.loading) {
            runInAction(() => {
              this.loading = false;
            });
          }
          console.log('Profiles loaded successfully!');
        });
      })
      .catch(e => {
        console.error(e);
        NewToaster.show({
          message: `Reading profiles.yml failed: ${e.message}`,
          className: 'danger',
          icon: 'thumbs-down'
        });
        logToMain('error', 'Failed to read profiles.yml: ' + e.message);
      });
  }

  @action.bound
  save() {
    if (!this.profilesFilePath) {
      return;
    }
    this.loading = true;
    try {
      const exportProfiles = this.sanitize(toJS(this.profiles));
      return featherClient()
        .service('files')
        .create({
          _id: this.profilesFilePath,
          content: yaml.safeDump(exportProfiles, { skipInvalid: true }),
          watching: false
        })
        .then(() => {
          IS_DEVELOPMENT && console.debug('profiles.yml updated');
          runInAction(() => {
            this.loading = false;
          });
        })
        .catch(console.error);
    } catch (e) {
      console.error(e);
      NewToaster.show({
        message: `Saving profiles.yml failed: ${e.message}`,
        className: 'danger',
        icon: 'thumbs-down'
      });
      logToMain('error', 'Failed to save profiles.yml: ' + e.message);
    }
  }
}
