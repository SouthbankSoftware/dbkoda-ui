/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:43:58+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-15T16:38:36+11:00
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
import { observable, toJS, runInAction } from 'mobx';
import Ajv from 'ajv';

export const FieldBindings = {
  text: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange'],
  password: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange'],
  number: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange'],
  checkbox: ['name', 'value', 'type', 'id', 'placeholder', 'onClick'],
};

export const Subforms = {
  forms: ['basic', 'cluster', 'advanced', 'url', 'ssh']
};

export class ConnectionForm {
  formErrors: []
  validateErrors: null
  constructor() {
    this.formErrors = [];
  }
  getInstance() {
    const form = observable({
      basic: {
        name: 'Basic',
        fields: [
          {
            name: 'alias',
            label: 'Connection Name',
            value: 'Connection - 1',
            type: 'text',
            column: 1
            // rules: 'required|string',
          },
          {
            name: 'host',
            label: 'Host',
            value: 'localhost',
            type: 'text',
            column: 1,
            disabled: false,
            checkbox: 'disabled'
            // rules: 'string',
          },
          {
            name: 'port',
            label: 'Port',
            value: '27017',
            type: 'number',
            options: {
              min: 0,
              max: 65535
            },
            column: 1,
            disabled: false,
            checkbox: 'disabled'
            // rules: 'numeric',
          },
          {
            name: 'database',
            label: 'Database',
            value: 'admin',
            type: 'text',
            column: 1
          },
          {
            name: 'sha',
            value: false,
            label: 'SCRAM-SHA-1(username/password)',
            type: 'checkbox',
            column: 2,
            refFields: ['username', 'password']
          },
          {
            name: 'username',
            label: 'Username',
            icon: 'user',
            type: 'text',
            column: 2,
            width: 0.5,
            disabled: true,
            checkbox: 'enabled'
          },
          {
            name: 'password',
            label: 'Password',
            icon: 'password',
            type: 'password',
            column: 2,
            width: 0.5,
            disabled: true,
            checkbox: 'enabled'
          },
          {
            name: 'urlRadio',
            label: 'Use URI instead',
            value: false,
            type: 'checkbox',
            column: 2,
            refFields: ['url', 'host', 'port']
          },
          {
            name: 'url',
            label: 'URI',
            placeholder: 'mongodb://',
            // rules: 'regex:/^mongodb:///',
            value: 'mongodb://',
            type: 'text',
            column: 2,
            disabled: true,
            checkbox: 'enabled'
          }
        ]
      },
      cluster: {
        name: 'Cluster',
        fields: [
          {
            name: 'hostsList',
            label: 'List of hosts:ports',
            value: '',
            type: 'text',
            column: 1
            // rules: 'string',
          },
          {
            name: 'replicaSetName',
            label: 'Replica Set Name',
            value: '',
            type: 'text',
            column: 1
            // rules: 'string',
          },
          {
            name: 'w',
            label: 'w',
            value: '',
            type: 'text',
            column: 2
            // rules: 'string',
          },
          {
            name: 'wTimeout',
            label: 'wtimeout',
            value: 0,
            type: 'number',
            column: 2
            // rules: 'string',
          },
          {
            name: 'journal',
            label: 'Journal',
            value: true,
            type: 'checkbox',
            column: 2
          },
          {
            name: 'readPref',
            label: 'Read Preference',
            value: 'primary',
            options: ['primary', 'secondary'],
            type: 'combo',
            column: 2
          },
          {
            name: 'urlCluster',
            label: 'URI',
            placeholder: 'mongodb://',
            // rules: 'regex:/^mongodb:///',
            value: 'mongodb://',
            type: 'text',
            column: 2
          }
        ]
      },
      advanced: {
        name: 'Advanced',
        fields: []
      },
      url: {
        name: 'URL Builder',
        fields: []
      },
      ssh: {
        name: 'SSH',
        fields: []
      }
    });
    return form;
  }

  getInstanceFromProfile(profile) {
    const form = this.getInstance();
    for (const subform in form) {
      if (form.hasOwnProperty(subform)) {
        subform.fields.forEach((field) => {
          field.value = profile[field.name];
        });
      }
    }
    return form;
  }

  getValidationSchema() {
    return {
      'additionalProperties': false,
      'properties': {
        'basic': {
          'type': 'object',
          'properties': {
            'fields': {
              'type': 'array',
              'additionalProperties': false,
              'items': [
                {
                  'additionalProperties': false,
                  'properties': {
                    'name': {'type': 'string'},
                    'value': {'type': 'string', 'minLength': 1}
                  }
                }
              ]
            }
          }
        }
      }
    };
  }

  validateForm(formInstance) {
    if (!this.validateErrors) {
      const ajv = new Ajv({removeAdditional: true});
      const schema = this.getValidationSchema();
      this.validateErrors = ajv.compile(schema);
    }

    const formData = toJS(formInstance);
    const status = this.validateErrors(formData);
    const { errors } = this.validateErrors;

    if (errors) {
      for (const error of errors) {
        const errorPath = error.dataPath.substring(1, error.dataPath.lastIndexOf('.'));
        const field = _.at(formInstance, errorPath);
        console.log(field);
        runInAction(() => {
          field[0].error = error.message;
        });
      }
      this.formErrors = errors;
    }

    return {status, formData};
  }

  getProfileFromInstance(formInstance) {
    console.log('getProfileFromInstance:', formInstance);
    return {};
  }

  onConnect(formInstance) {
    const result = this.validateForm(formInstance);
    console.log('Validation: ', result.status, result.formData);
  }
  onSave(formInstance) {
    console.log('onSave:', formInstance);
  }

  onTest(formInstance) {
    console.log('onTest:', formInstance);
  }

  onReset(formInstance) {
    console.log('onReset:', formInstance);
  }
}
