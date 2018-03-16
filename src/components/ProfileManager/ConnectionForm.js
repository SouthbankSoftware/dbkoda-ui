/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:43:58+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-31T11:40:21+11:00
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

import { action } from 'mobx';
import { Profile } from '~/api/Profile';
import { JsonForm } from './JsonForm';

const MAX_URL_ALIAS_LENGTH = 25;
const MAX_HOSTNAME_ALIAS_LENGTH = 20;

export class ConnectionForm extends JsonForm {
  constructor(api) {
    super(api);

    const formSchema = require('./Forms/ConnectionForm.json');
    this.loadFormSchema(formSchema);
    const validationSchema = require('./Forms/ConnectionFormValidation.json');
    this.loadValidationSchema(validationSchema);

    this.hasAliasChanged = false;
    this.isEditMode = false;
  }
  /**
   * Overrided function from JsonForm to update the alias
   */
  getSubformFields(selectedSubform, column) {
    const fieldsCol = [];
    const subForm = this.formSchema[selectedSubform];
    if (subForm.fields) {
      subForm.fields.forEach((field) => {
        if (field.name === 'alias') {
          this.updateAlias(field);
        }
        if (field.column === column) {
          fieldsCol.push(field);
        }
      });
    }
    return fieldsCol;
  }
  /**
   * Overrided function from JsonForm to update the alias on certain fields
   */
  @action
  updateFieldValue(field, newValue) {
    if (field.name === 'alias' && field.value !== newValue) {
      this.hasAliasChanged = true;
    }
    if (field.type === 'number' && typeof newValue === 'string') {
      newValue = Number(newValue);
    }
    field.value = newValue;
    if (field.refFields) {
      this.updateReferencedFields(field);
    }
    if (field.name == 'host' || field.name == 'urlRadio' || field.name == 'port' || field.name == 'username' || field.name == 'url') {
      this.updateAlias(field);
    }

    this.validateForm();
  }
  /**
   * Function to update the alias field on certain other fields
   */
  @action
  updateAlias(field) {
    if (!this.isEditMode && !this.hasAliasChanged && field.subForm.name == 'Basic Connection') {
      const isUrlMode = field.$('urlRadio').value;
      const aliasField = field.$('alias');

      if (!isUrlMode) {
        if (
          field.$('host').value.length > MAX_HOSTNAME_ALIAS_LENGTH &&
          field.$('username').value.length > 0
        ) {
          aliasField.value = field.$('username').value +
          '@' +
          field.$('host').value.substring(0, MAX_HOSTNAME_ALIAS_LENGTH) +
          ':' +
          field.$('port').value +
          ' - ' +
          (this.api.getProfiles().size + 1);
        } else if (
          field.$('host').value.length > MAX_HOSTNAME_ALIAS_LENGTH
        ) {
          aliasField.value =
            field.$('host').value.substring(0, MAX_HOSTNAME_ALIAS_LENGTH) +
            ':' +
            field.$('port').value +
            ' - ' +
            (this.api.getProfiles().size + 1);
        } else if (field.$('username').value.length > 0) {
          aliasField.value =
            field.$('username').value +
            '@' +
            field.$('host').value +
            ':' +
            field.$('port').value +
            ' - ' +
            (this.api.getProfiles().size + 1);
        } else {
          aliasField.value =
            field.$('host').value +
            ':' +
            field.$('port').value +
            ' - ' +
            (this.api.getProfiles().size + 1);
        }
      } else {
        console.log(field);
        if (field.$('url').value.length > MAX_URL_ALIAS_LENGTH) {
          if (field.$('url').value.split('//').length > 1) {
            aliasField.value = field
              .$('url')
              .value.split('//')[1]
              .substring(0, MAX_URL_ALIAS_LENGTH);
          } else {
            aliasField.value = field
              .$('url')
              .value.substring(0, MAX_URL_ALIAS_LENGTH);
          }
        } else if (field.$('url').value.split('//').length > 1) {
          if (field.$('url').value.split('//')[1] === '') {
            aliasField.value = 'New Profile - ' + (this.api.getProfiles().size + 1);
          } else {
            aliasField.value = field.$('url').value.split('//')[1]; //eslint-disable-line
          }
        } else {
          aliasField.value = field.$('url').value;
        }
      }
    }
  }
  /**
   * Function to update the connection form schema from connection profile
   */
  updateSchemaFromProfile(profile: Profile) {
    this.isEditMode = true;
    for (const subform in this.formSchema) {
      if (this.formSchema.hasOwnProperty(subform)) {
        this.formSchema[subform].fields.forEach((field) => {
          if (profile[field.name] !== null && profile[field.name] !== undefined) {
            this.updateFieldValue(field, profile[field.name]);
            // field.value = profile[field.name];
          }
        });
      }
    }
  }
  /**
   * Function to get connection profile from schema
   */
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

    if (profile.urlRadio !== null && profile.urlRadio !== undefined) {
      profile.hostRadio = !profile.urlRadio;
    }

    return profile;
  }
  /**
   * Event handler for connect button
   */
  onConnect() {
    const result = this.validateForm();
    console.log('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    console.log('Profile:', profile);
    return this.api.connectProfile(profile);
  }
  /**
   * Event handler for Save button
   */
  onSave() {
    const result = this.validateForm();
    console.log('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    console.log('Profile:', profile);
    return this.api.saveProfile(profile);
  }
  /**
   * Event handler for Test button
   */
  onTest() {
    const result = this.validateForm();
    console.log('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    console.log('Profile:', profile);
    profile.test = true;
    return this.api.connectProfile(profile);
  }
  /**
   * Event handler for Reset button
   */
  onReset() {
    this.formErrors = [];
    this.formSchema = this.loadDefaultSchema();
    console.log('onReset:', this.formSchema);
  }
}
