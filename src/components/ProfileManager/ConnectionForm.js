/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:43:58+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-24T10:09:26+11:00
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

import { Profile } from '~/api/Profile';
import { JsonForm } from './JsonForm';

export class ConnectionForm extends JsonForm {
  constructor(api) {
    super(api);

    const formSchema = require('./Forms/ConnectionForm.json');
    this.loadFormSchema(formSchema);
    const validationSchema = require('./Forms/ConnectionFormValidation.json');
    this.loadValidationSchema(validationSchema);
  }

  updateSchemaFromProfile(profile: Profile) {
    for (const subform in this.formSchema) {
      if (this.formSchema.hasOwnProperty(subform)) {
        this.formSchema[subform].fields.forEach((field) => {
          field.value = profile[field.name];
        });
      }
    }
  }

  getProfileFromSchema(formData): Profile {
    const profile = {};
    console.log('getProfileFromInstance:', formData);
    for (const subform in formData) {
      if (formData.hasOwnProperty(subform)) {
        formData[subform].fields.forEach((field) => {
          if (field.value !== undefined && field.value !== null) {
            if (!field.hasOwnProperty('disabled') || (field.hasOwnProperty('disabled') && field.disabled === false)) {
              profile[field.name] = field.value;
            }
          }
        });
      }
    }
    return profile;
  }

  onConnect() {
    const result = this.validateForm();
    console.log('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    console.log('Profile:', profile);
    return this.api.connectProfile(profile);
  }
  onSave() {
    const result = this.validateForm();
    console.log('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    console.log('Profile:', profile);
    return this.api.saveProfile(profile);
  }

  onTest() {
    const result = this.validateForm();
    console.log('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    console.log('Profile:', profile);
    profile.test = true;
    return this.api.connectProfile(profile);
  }

  onReset() {
    this.formErrors = [];
    this.formSchema = this.loadDefaultSchema();
    console.log('onReset:', this.formSchema);
  }
}
