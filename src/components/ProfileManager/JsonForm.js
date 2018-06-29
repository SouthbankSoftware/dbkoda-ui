/**
 * @flow
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-24T09:50:36+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-06-29T10:53:09+10:00
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
import autobind from 'autobind-decorator';
import { observable, toJS, runInAction, action, set } from 'mobx';
import Ajv from 'ajv';

// FieldBindings are required in the UI components of Fields to bind to specified properties
export const FieldBindings = {
  text: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange', 'onBlur'],
  inplacetext: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange', 'onConfirm'],
  password: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onChange', 'onBlur'],
  number: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onValueChange', 'onBlur'],
  checkbox: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onClick', 'onChange', 'onBlur'],
  switch: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onClick', 'onChange', 'onBlur'],
  file: ['name', 'value', 'id', 'placeholder', 'disabled', 'onChange', 'onBlur'],
  select: ['name', 'value', 'id', 'placeholder', 'disabled', 'onChange', 'onBlur']
};
export type Field = {
  name: string,
  label: string,
  value: string | number | boolean,
  type: string,
  column: number,
  placeholder?: string,
  refFields?: Array<string>,
  disabled?: boolean,
  checkbox?: string,
  options?: {},
  id?: string,
  subForm: SubForm, // eslint-disable-line
  $: (siblingFieldName: string, siblingSubform?: string) => Field | null | void,
  bind?: () => {},
  onConfirm?: () => void,
  onValueChange?: (e: any) => void,
  onClick?: (e: any) => void,
  onBlur?: () => void,
  onChange?: (e: any) => void
};
export type SubForm = {
  name: string,
  value: string,
  tips: Array<string>,
  fields: Array<Field>
};
export type Form = { [string]: SubForm };

export class JsonForm {
  api: *;
  formSchema: Form;
  validationSchema: {};
  formErrors: [];
  validateErrors: (formData: {}) => boolean;
  @observable isFormInvalid: boolean = false;

  constructor(api: *) {
    this.api = api;
    this.formErrors = [];
  }
  /**
   * Function to load schema to create form fields
   */
  loadFormSchema(jsonSchema: Form) {
    this.formSchema = observable.object(jsonSchema);

    // This loop will add the additional required properties which are required by renderer UI fields
    for (const subform in this.formSchema) {
      if (this.formSchema.hasOwnProperty(subform)) {
        this.formSchema[subform].fields.forEach(field => {
          this.addAdditionalFieldProps(field, this.formSchema[subform]);
        });
      }
    }
  }
  /**
   * Function to load validation schema to validate form fields
   */
  loadValidationSchema(jsonSchema: {}) {
    this.validationSchema = jsonSchema;
  }
  /**
   * Function to get the subform keys to get subform fields
   */
  @autobind
  getSubForms(): Array<string> {
    return Object.keys(this.formSchema);
  }
  /**
   * Function to get subform fields
   */
  getSubformFields(selectedSubform: string, column: number): Array<Field> {
    const fieldsCol = [];
    const subForm: SubForm = this.formSchema[selectedSubform];
    if (subForm.fields) {
      subForm.fields.forEach(field => {
        if (field.column === column) {
          fieldsCol.push(field);
        }
      });
    }
    return fieldsCol;
  }
  /**
   * Function to get the subform Tips if there are any
   */
  getSubformTips(selectedSubform: string): Array<string> {
    const subForm: SubForm = this.formSchema[selectedSubform];
    if (subForm && subForm.tips) {
      return subForm.tips;
    }
    return [];
  }
  /**
   * Private function to add additional Props to a form field which are used in UI renderer of fields
   */
  @action
  addAdditionalFieldProps(field: Field, subForm: SubForm) {
    field.id = field.name; // fix to add id as required by UI fields
    field.subForm = subForm;
    field.$ = (siblingFieldName, siblingSubform = '') => {
      // get Sibling field of the sub form
      let refField: Field;
      if (siblingSubform !== '') {
        // $FlowFixMe
        refField = _.find(this.formSchema[siblingSubform].fields, f => {
          return f.name === siblingFieldName;
        });
      } else {
        // $FlowFixMe
        refField = _.find(field.subForm.fields, f => {
          return f.name === siblingFieldName;
        });
      }
      return refField;
    };
    set(field, { error: '' });
    field.onChange = action(e => {
      if (field.type === 'checkbox' || field.type === 'switch') {
        return;
      } else if (field.type === 'inplacetext') {
        this.updateFieldValue(field, e);
        return;
      }
      this.updateFieldValue(field, e.currentTarget.value);
    });
    field.onBlur = () => {
      this.validateForm();
    };
    if (field.type == 'checkbox' || field.type == 'switch') {
      field.onClick = action(e => {
        this.updateFieldValue(field, e.currentTarget.checked);
      });
    } else if (field.type === 'number') {
      field.onValueChange = action(value => {
        this.updateFieldValue(field, value);
      });
    } else if (field.type === 'inplacetext') {
      field.onConfirm = () => {
        this.validateForm();
      };
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
  /**
   * Function to update field value and also update values of referenced fields if defined in the schema
   */
  @action
  updateFieldValue(field: Field, newValue: *) {
    field.value = newValue;
    if (field.refFields) {
      this.updateReferencedFields(field);
    }
    this.validateForm();
  }

  /**
   * Function to update referenced fields values defined in the schema
   */
  @action
  updateReferencedFields(field: Field) {
    const { subForm } = field;
    if (subForm && subForm.fields) {
      if (field.refFields) {
        for (const fld of field.refFields) {
          // $FlowFixMe
          const refField: Field = _.find(subForm.fields, f => {
            return f.name === fld;
          });
          if (field.type === 'checkbox' || field.type === 'switch') {
            if (field.disabled) {
              refField.disabled = true;
            } else if (refField.checkbox === 'enabled' && typeof field.value === 'boolean') {
              refField.disabled = !field.value;
            } else if (refField.checkbox === 'disabled' && typeof field.value === 'boolean') {
              refField.disabled = field.value;
            }
            if (refField.refFields) {
              this.updateReferencedFields(refField);
            }
          }
        }
      }
    }
  }
  /**
   * Function to validate form fields if Validation schema is present
   */
  validateForm() {
    if (!this.validationSchema) {
      throw new Error('Validation Json schema is not set for the form.');
    }
    if (!this.validateErrors) {
      const ajv = new Ajv({
        removeAdditional: true,
        $data: true,
        allErrors: true,
        jsonPointers: true
      });
      require('ajv-keywords')(ajv);
      require('ajv-errors')(ajv);
      this.validateErrors = ajv.compile(this.validationSchema);
    }
    // reset the errors if present from previous validation
    if (this.formErrors) {
      for (const error of this.formErrors) {
        const errorPath = error.dataPath.substring(1, error.dataPath.lastIndexOf('.'));
        let field = _.at(this.formSchema, errorPath);
        if ((field.length > 0 && field[0] === undefined) || field[0] === null) {
          const schemaPath = error.schemaPath
            .substring(1, error.schemaPath.lastIndexOf('/'))
            .replace(/\/properties\//g, '.')
            .replace(/(\/items\/)(\d*)/, '[$2]')
            .substr(1, error.schemaPath.length);
          field = _.at(this.formSchema, schemaPath);
        }
        if (field.length > 0 && field[0] && typeof field[0] === 'object') {
          runInAction(() => {
            field[0].error = '';
          });
        }
      }
      this.formErrors = [];
    }

    const formData = toJS(this.formSchema);
    const status = this.validateErrors(formData);
    const { errors } = this.validateErrors;

    // if Errors found, Add them to fields for UI display and keep their record in form
    if (errors) {
      for (const error of errors) {
        const errorPath = error.dataPath.substring(1, error.dataPath.lastIndexOf('.'));
        let field = _.at(this.formSchema, errorPath);
        if ((field.length > 0 && field[0] === undefined) || field[0] === null) {
          const schemaPath = error.schemaPath
            .substring(1, error.schemaPath.lastIndexOf('/'))
            .replace(/\/properties\//g, '.')
            .replace(/(\/items\/)(\d*)/, '[$2]')
            .substr(1, error.schemaPath.length);
          field = _.at(this.formSchema, schemaPath);
        }
        if (field.length > 0 && field[0] && typeof field[0] === 'object') {
          runInAction(() => {
            field[0].error = error.message;
          });
        }
      }
      this.formErrors = errors;
    }
    runInAction(() => {
      this.isFormInvalid = !(this.formErrors && this.formErrors.length <= 0);
    });
    return { status, formData };
  }
}
