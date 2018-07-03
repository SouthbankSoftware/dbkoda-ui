/**
 * @flow
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:43:58+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-07-03T16:36:31+10:00
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
import { action } from 'mobx';
import mongodbUri from 'mongodb-uri';
import StaticApi from '~/api/static';
import { Profile } from '~/api/Profile';
import { JsonForm } from './JsonForm';
import type { Field, SubForm, Form } from './JsonForm';

const MAX_URL_ALIAS_LENGTH = 25;
const MAX_HOSTNAME_ALIAS_LENGTH = 20;
export const SubformCategory = {
  BASIC: 'basic',
  AUTH: 'authentication',
  CLUSTER: 'cluster',
  SSH: 'ssh'
};

export class ConnectionForm extends JsonForm {
  hasAliasChanged: boolean;
  isEditMode: boolean;
  constructor(api: *) {
    super(api);

    this.loadDefaultSchema();
  }
  loadDefaultSchema() {
    const formSchema: Form = require('./Forms/ConnectionForm.json');
    this.loadFormSchema(formSchema);
    const validationSchema = require('./Forms/ConnectionFormValidation.json');
    this.loadValidationSchema(validationSchema);

    this.hasAliasChanged = false;
    this.isEditMode = false;
  }
  /**
   * Overrided function from JsonForm to update the alias
   */
  getSubformFields(selectedSubform: string, column: number): Array<Field> {
    const fieldsCol = [];
    const subForm: SubForm = this.formSchema[selectedSubform];
    if (subForm.fields) {
      subForm.fields.forEach(field => {
        // Update fields on load
        if (selectedSubform === SubformCategory.BASIC) {
          if (field.name === 'alias') {
            this.updateAlias(field);
          } else if (field.name === 'url') {
            this.updateUrl(field);
          }
        } else if (selectedSubform === SubformCategory.CLUSTER) {
          if (field.name === 'urlCluster') {
            this.updateClusterUrl(field);
          } else if (field.name === 'useClusterConfig') {
            this.updateReferencedFields(field);
          }
        }

        if (field.column === column) {
          fieldsCol.push(field);
        }
      });
    }
    return fieldsCol;
  }
  /**
   * Overrided function from JsonForm to update the some fieds based on change in certain fields
   */
  @action
  updateFieldValue(field: Field, newValue: any) {
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
    if (
      field.name == 'host' ||
      field.name == 'urlRadio' ||
      field.name == 'port' ||
      field.name == 'username' ||
      field.name == 'url' ||
      field.name == 'usernameCluster' ||
      field.name == 'replicaSetName' ||
      field.name == 'useClusterConfig' ||
      field.name == 'urlClusterRadio' ||
      field.name == 'urlCluster'
    ) {
      this.updateAlias(field);
    }

    if (
      field.subForm.value === SubformCategory.BASIC &&
      field.name !== 'urlRadio' &&
      field.name !== 'url'
    ) {
      this.updateUrl(field);
    }

    if (field.subForm.value === SubformCategory.BASIC && field.name === 'url') {
      const urlRadioField = field.$('urlRadio');
      const isUrlMode = urlRadioField && urlRadioField.value;
      if (isUrlMode) {
        this.updateFormViaURL(field);
      }
    }

    if ((field.name === 'urlClusterRadio' || field.name === 'useClusterConfig') && field.value) {
      // update cluster fields from basic connection fields
      this.updateClusterFieldsFromBasic(field);
    } else if (field.name === 'useBasicConfig' && !field.value) {
      const useClusterField = field.$('useClusterConfig', SubformCategory.CLUSTER);
      if (useClusterField) {
        this.updateClusterFieldsFromBasic(useClusterField);
      }
    }
    if (
      field.subForm.value === SubformCategory.CLUSTER &&
      field.name !== 'urlClusterRadio' &&
      field.name !== 'urlCluster'
    ) {
      this.updateClusterUrl(field);
    }

    if (field.name === 'useBasicConfig') {
      const useClusterField = field.$('useClusterConfig', SubformCategory.CLUSTER);
      if (useClusterField) {
        useClusterField.value = !field.value;
        this.updateReferencedFields(useClusterField);
      }
    } else if (field.name === 'useClusterConfig') {
      const useBasicField = field.$('useBasicConfig', SubformCategory.BASIC);
      if (useBasicField) {
        useBasicField.value = !field.value;
        this.updateReferencedFields(useBasicField);
      }
    }

    if (field.subForm.value === SubformCategory.SSH && field.name === 'ssh') {
      this.updateRemoteHost(field);
    }

    this.validateForm();
  }
  @action
  updateUrl(field: Field) {
    const urlField = field.$('url');
    const urlRadioField = field.$('urlRadio');
    const isUrlMode = urlRadioField && urlRadioField.value;
    if (!isUrlMode && urlField) {
      const hostField = field.$('host');
      const portField = field.$('port');
      const databaseField = field.$('database');
      let connectionUrl = '';
      if (hostField && portField && databaseField) {
        connectionUrl =
          StaticApi.mongoProtocol + String(hostField.value) + ':' + String(portField.value);
        const conDB: string = String(databaseField.value);
        connectionUrl += '/';
        connectionUrl += conDB === '' ? 'test' : conDB;
      }

      const sslField = field.$('ssl');
      if (sslField && sslField.value === true) {
        connectionUrl.indexOf('?') > 0
          ? (connectionUrl += '&ssl=true')
          : (connectionUrl += '?ssl=true');
      }

      urlField.value = connectionUrl;
    }
  }

  @action
  updateFormViaURL(urlField: Field) {
    let urlParams = {};
    try {
      urlParams = mongodbUri.parse(urlField.value);
    } catch (err) {
      l.error('updateFormViaURL:: failed to parse url ::', urlField.value);
      return;
    }
    console.log(urlParams);
    if (urlParams.hosts.length === 1) {
      const [{ host, port }] = urlParams.hosts; // urlParams.hosts.map((host) => { return host.host + ':' + host.port; }).join(',');
      const hostField = urlField.$('host');
      if (hostField) {
        hostField.value = host;
      }
      const portField = urlField.$('port');
      if (portField) {
        portField.value = !isNaN(port) ? port : 27017;
      }
    }
    if (urlParams.database) {
      const databaseField = urlField.$('database');
      if (databaseField) {
        databaseField.value = urlParams.database;
      }
    }
    if (urlParams.username) {
      const shaField = urlField.$('sha');
      if (shaField && shaField.value === false) {
        shaField.value = true;
        this.updateReferencedFields(shaField);
      }
      const usernameField = urlField.$('username');
      if (usernameField) {
        usernameField.value = urlParams.username;
      }
      if (urlParams.password) {
        const passwordField = urlField.$('password');
        if (passwordField) {
          passwordField.value = urlParams.password;
        }
      }
    }
    if (urlParams.options) {
      const { options } = urlParams;

      const sslField = urlField.$('ssl');
      if (sslField) {
        if (options.ssl && (options.ssl === 'true' || options.ssl === true)) {
          sslField.value = true;
        } else {
          sslField.value = false;
        }
      }
    }
  }

  @action
  updateClusterUrl(field: Object) {
    const urlField = field.$('urlCluster');
    const isUrlMode = field.$('urlClusterRadio').value;
    if (!isUrlMode) {
      let connectionUrl = StaticApi.mongoProtocol;

      connectionUrl += field.$('hostsList').value;
      connectionUrl += '/';

      const conDB = field.$('databaseCluster').value;
      connectionUrl += conDB === '' ? 'test' : conDB;

      const addQueryParam = (key, value) => {
        let addQM = false;
        if (connectionUrl.indexOf('?') < 0) {
          connectionUrl += '?';
          addQM = true;
        }
        if (connectionUrl.indexOf(key) < 0) {
          if (!addQM) {
            connectionUrl += '&';
          }
          connectionUrl += key + '=' + value;
        }
      };
      if (field.$('replicaSetName').value !== '') {
        addQueryParam('replicaSet', field.$('replicaSetName').value);
      }
      if (field.$('w').value !== '') {
        addQueryParam('w', field.$('w').value);
      }
      if (field.$('wtimeoutMS').value !== 0) {
        addQueryParam('wtimeoutMS', field.$('wtimeoutMS').value);
      }
      if (field.$('journal').value !== false) {
        addQueryParam('j', 'true');
      }
      if (field.$('readPref').value !== '') {
        addQueryParam('readPreference', field.$('readPref').value);
      }

      urlField.value = connectionUrl;
    }
  }
  /**
   * Function to update the alias field on certain other fields
   */
  @action
  updateAlias(field: Object) {
    if (!this.isEditMode && !this.hasAliasChanged) {
      const aliasField = field.$('alias', SubformCategory.BASIC);
      const useBasicField = field.$('useBasicConfig', SubformCategory.BASIC);
      const useClusterField = field.$('useClusterConfig', SubformCategory.CLUSTER);
      const profileNo = String(this.api.getProfiles().size + 1).padStart(2, '0');
      if (useBasicField.value) {
        field = useBasicField;
        const isUrlMode = field.$('urlRadio').value;
        if (!isUrlMode) {
          const profileUsername =
            field.$('username').value.length > 0 ? field.$('username').value + '@' : '';
          const profileHostname = field.$('host').value.substring(0, MAX_HOSTNAME_ALIAS_LENGTH);
          if (profileUsername.length > 0 || profileHostname.length > 0) {
            aliasField.value =
              profileNo + ' - ' + profileUsername + profileHostname + ':' + field.$('port').value;
          } else {
            aliasField.value = profileNo + ' - New Profile';
          }
        } else {
          this.updateAliasViaUrlValue(aliasField, field.$('url').value);
        }
      } else if (useClusterField.value) {
        field = useClusterField;
        const isUrlMode = field.$('urlClusterRadio').value;
        if (!isUrlMode) {
          if (field.$('usernameCluster').value.length > 0) {
            aliasField.value =
              profileNo +
              ' - ' +
              field.$('usernameCluster').value +
              '@' +
              field.$('replicaSetName').value;
          } else if (field.$('replicaSetName').value.length > 0) {
            aliasField.value = profileNo + ' - ' + field.$('replicaSetName').value;
          } else {
            aliasField.value = profileNo + ' - New Cluster Profile';
          }
        } else {
          this.updateAliasViaUrlValue(aliasField, field.$('urlCluster').value);
        }
      }
    }
  }
  updateAliasViaUrlValue(aliasField: Object, urlValue: string) {
    let urlParams = {};
    if (urlValue.length > 0) {
      try {
        urlParams = mongodbUri.parse(urlValue);
        urlParams = _.omit(urlParams, ['password']);
        urlValue = mongodbUri.format(urlParams);
      } catch (err) {
        l.error('updateAliasViaUrlValue:: failed to parse url ::', urlValue);
      }
    } else {
      return;
    }
    const profileNo = String(this.api.getProfiles().size + 1).padStart(2, '0');
    if (urlParams.options && urlParams.options.replicaSet) {
      if (urlParams.username) {
        aliasField.value =
          profileNo + ' - ' + urlParams.username + '@' + urlParams.options.replicaSet;
      } else {
        aliasField.value = profileNo + ' - ' + urlParams.options.replicaSet;
      }
    } else if (urlValue.split('//').length > 1) {
      if (urlValue.split('//')[1] === '') {
        aliasField.value = profileNo + ' - New Profile';
      } else {
        aliasField.value =
          profileNo + ' - ' + urlValue.split('//')[1].substring(0, MAX_URL_ALIAS_LENGTH);
      }
    } else {
      aliasField.value = profileNo + ' - ' + urlValue.substring(0, MAX_URL_ALIAS_LENGTH);
    }
  }

  updateClusterFieldsFromBasic(field: Object) {
    const hostListField = field.$('hostsList');
    const hostField = field.$('host', SubformCategory.BASIC);
    const portField = field.$('port', SubformCategory.BASIC);
    if (hostField.value !== '' && portField.value !== '' && hostListField.value === '') {
      hostListField.value = hostField.value + ':' + portField.value;
    }
    const databaseField = field.$('database', SubformCategory.BASIC);
    if (databaseField.value !== '' && databaseField.value !== field.$('databaseCluster').value) {
      field.$('databaseCluster').value = databaseField.value;
    }
    const sslField = field.$('ssl', SubformCategory.BASIC);
    if (sslField.value && sslField.value !== field.$('sslCluster').value) {
      field.$('sslCluster').value = sslField.value;
    }
    const sslAllowInvalidCertificatesField = field.$(
      'sslAllowInvalidCertificates',
      SubformCategory.BASIC
    );
    if (
      sslAllowInvalidCertificatesField.value &&
      sslAllowInvalidCertificatesField.value !== field.$('sslAllowInvalidCertificatesCluster').value
    ) {
      field.$('sslAllowInvalidCertificatesCluster').value = sslAllowInvalidCertificatesField.value;
    }
    const shaField = field.$('sha', SubformCategory.BASIC);
    if (shaField.value && shaField.value !== field.$('shaCluster').value) {
      field.$('shaCluster').value = shaField.value;
      if (field.$('shaCluster').refFields) {
        this.updateReferencedFields(field.$('shaCluster'));
      }
    }
    const usernameField = field.$('username', SubformCategory.BASIC);
    if (usernameField.value !== '' && usernameField.value !== field.$('usernameCluster').value) {
      field.$('usernameCluster').value = usernameField.value;
    }
    const passwordField = field.$('password', SubformCategory.BASIC);
    if (passwordField.value !== '' && passwordField.value !== field.$('passwordCluster').value) {
      field.$('passwordCluster').value = passwordField.value;
    }
    const authenticationDatabaseField = field.$('authenticationDatabase', SubformCategory.BASIC);
    if (
      authenticationDatabaseField.value !== '' &&
      authenticationDatabaseField.value !== field.$('authenticationDatabaseCluster').value
    ) {
      field.$('authenticationDatabaseCluster').value = authenticationDatabaseField.value;
    }
  }
  updateRemoteHost(field: Object) {
    if (field.value) {
      const remoteHostField = field.$('remoteHost');
      remoteHostField.value = field.$('host', SubformCategory.BASIC).value;
    }
  }
  /**
   * Function to update the connection form schema from connection profile
   */
  updateSchemaFromProfile(profile: Profile) {
    this.isEditMode = true;
    for (const subform in this.formSchema) {
      if (this.formSchema.hasOwnProperty(subform)) {
        this.formSchema[subform].fields.forEach(field => {
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
  getProfileFromSchema(formData: Form): Profile {
    const profile = {};
    l.info('getProfileFromInstance:', formData);
    for (const subform in formData) {
      if (formData.hasOwnProperty(subform)) {
        formData[subform].fields.forEach(field => {
          if (field.value !== undefined && field.value !== null) {
            // if (!field.hasOwnProperty('disabled') || (field.hasOwnProperty('disabled') && field.disabled === false)) {
            profile[field.name] = field.value;
            // }
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
    l.info('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    l.info('Profile:', profile);
    return this.api.connectProfile(profile);
  }
  /**
   * Event handler for Save button
   */
  onSave() {
    const result = this.validateForm();
    l.info('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    l.info('Profile:', profile);
    return this.api.saveProfile(profile);
  }
  /**
   * Event handler for Test button
   */
  onTest() {
    const result = this.validateForm();
    l.info('Validation: ', result.status, result.formData);
    const profile = this.getProfileFromSchema(result.formData);
    l.info('Profile:', profile);
    profile.test = true;
    return this.api.connectProfile(profile);
  }
  /**
   * Event handler for Reset button
   */
  onReset() {
    this.formErrors = [];
    this.loadDefaultSchema();
    l.info('onReset:', this.formSchema);
  }
}
