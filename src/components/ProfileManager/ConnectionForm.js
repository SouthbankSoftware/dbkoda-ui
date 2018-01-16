/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:43:58+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-16T17:27:12+11:00
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
import { observable, toJS, runInAction, action, extendObservable } from 'mobx';
import Ajv from 'ajv';

export const FieldBindings = {
  text: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange', 'onBlur'],
  password: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange', 'onBlur'],
  number: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange', 'onBlur'],
  checkbox: ['name', 'value', 'type', 'id', 'placeholder', 'onClick', 'onBlur'],
};

export class ConnectionForm {
  formSchema: null
  formErrors: []
  validateErrors: null
  constructor() {
    this.formErrors = [];
    this.formSchema = this.loadDefaultSchema();

    this.getSubForms = this.getSubForms.bind(this);
  }
  getSubForms() {
    return Object.keys(this.formSchema);
  }
  loadDefaultSchema() {
    // eslint-disable-next-line
    const schema = require('./Forms/ConnectionForm.json');
    const form = observable(schema);
    return form;
  }

  updateSchemaFromProfile(profile) {
    for (const subform in this.formSchema) {
      if (this.formSchema.hasOwnProperty(subform)) {
        subform.fields.forEach((field) => {
          field.value = profile[field.name];
        });
      }
    }
  }

  getSubformFields(selectedSubform, column) {
    const fieldsCol = [];
    const subForm = this.formSchema[selectedSubform];
    if (subForm.fields) {
      subForm.fields.forEach((field) => {
        this.addAdditionalFieldProps(field, selectedSubform);
        if (field.column === column) {
          fieldsCol.push(field);
        }
      });
    }
    return fieldsCol;
  }

  addAdditionalFieldProps(field, subform) {
    field.id = field.name; // fix to add id as required by UI fields
    field.subform = subform;
    extendObservable(field, { error: ''});
    field.onChange = action((e) => {
      field.value = e.currentTarget.value;
      if (field.refFields) {
        this.updateReferencedFields(field);
      }
    });
    field.onBlur = () => {
      this.validateForm();
    };
    if (field.type == 'checkbox') {
      field.onClick = action((e) => {
        field.value = e.currentTarget.checked;
        if (field.refFields) {
          this.updateReferencedFields(field);
        }
      });
    }
    field.bind = () => {
      const binds = FieldBindings[field.type];
      const objProp = {};
      for (const prop of binds) {
        if (field.hasOwnProperty(prop)) {
          objProp[prop] = field[prop];
        }
      }
      return objProp;
    };
  }

  @action
  updateReferencedFields(field) {
    const subForm = this.formSchema[field.subform];
    if (subForm.fields) {
      for (const fld of field.refFields) {
        const refField = _.find(subForm.fields, (f) => {
          return f.name === fld;
        });
        if (field.type === 'checkbox') {
          if (refField.checkbox === 'enabled') {
            refField.disabled = !field.value;
          } else if (refField.checkbox === 'disabled') {
            refField.disabled = field.value;
          }
        }
      }
    }
  }

  getValidationSchema() {
    // eslint-disable-next-line
    const schema = require('./Forms/ConnectionFormValidation.json');
    return schema;
  }

  validateForm() {
    if (!this.validateErrors) {
      const ajv = new Ajv({removeAdditional: true});
      const schema = this.getValidationSchema();
      this.validateErrors = ajv.compile(schema);
    }

    if (this.formErrors) {
      for (const error of this.formErrors) {
        const errorPath = error.dataPath.substring(1, error.dataPath.lastIndexOf('.'));
        const field = _.at(this.formSchema, errorPath);
        runInAction(() => {
          field[0].error = '';
        });
      }
      this.formErrors = [];
    }

    const formData = toJS(this.formSchema);
    const status = this.validateErrors(formData);
    const { errors } = this.validateErrors;

    if (errors) {
      for (const error of errors) {
        const errorPath = error.dataPath.substring(1, error.dataPath.lastIndexOf('.'));
        const field = _.at(this.formSchema, errorPath);
        runInAction(() => {
          field[0].error = error.message;
        });
      }
      this.formErrors = errors;
    }

    return {status, formData};
  }

  getProfileFromSchema() {
    console.log('getProfileFromInstance:', this.formSchema);
    return {};
  }

  onConnect() {
    const result = this.validateForm();
    console.log('Validation: ', result.status, result.formData);
  }
  onSave() {
    console.log('onSave:', this.formSchema);
  }

  onTest() {
    console.log('onTest:', this.formSchema);
  }

  onReset() {
    console.log('onReset:', this.formSchema);
  }
}
