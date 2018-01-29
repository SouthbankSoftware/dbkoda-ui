/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-24T09:50:36+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-29T12:55:17+11:00
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
   number: ['name', 'value', 'type', 'id', 'placeholder', 'disabled', 'onValueChange', 'onBlur'],
   checkbox: ['name', 'value', 'type', 'id', 'placeholder', 'onClick', 'onBlur'],
   file: ['name', 'value', 'id', 'placeholder', 'disabled', 'onChange', 'onBlur'],
 };

 export class JsonForm {
   api: null
   formSchema: null
   validationSchema: null
   formErrors: []
   validateErrors: null
   @observable isFormInvalid: false;

   constructor(api) {
     this.api = api;
     this.formErrors = [];

     this.getSubForms = this.getSubForms.bind(this);
   }

   loadFormSchema(jsonSchema) {
     this.formSchema = observable(jsonSchema);

     // This loop will add the additional required properties which are required by renderer UI fields
     for (const subform in this.formSchema) {
       if (this.formSchema.hasOwnProperty(subform)) {
         this.formSchema[subform].fields.forEach(field => {
           this.addAdditionalFieldProps(field, this.formSchema[subform]);
         });
       }
     }
   }
   loadValidationSchema(jsonSchema) {
     this.validationSchema = jsonSchema;
   }
   getSubForms() {
     return Object.keys(this.formSchema);
   }

   getSubformFields(selectedSubform, column) {
     const fieldsCol = [];
     const subForm = this.formSchema[selectedSubform];
     if (subForm.fields) {
       subForm.fields.forEach((field) => {
         if (field.column === column) {
           fieldsCol.push(field);
         }
       });
     }
     return fieldsCol;
   }

   getSubformTips(selectedSubform) {
     const subForm = this.formSchema[selectedSubform];
     if (subForm && subForm.tips) {
       return subForm.tips;
     }
     return [];
   }

   @action
   addAdditionalFieldProps(field, subForm) {
     field.id = field.name; // fix to add id as required by UI fields
     field.subForm = subForm;
     field.$ = (siblingFieldName) => { // get Sibling field of the sub form
       const refField = _.find(field.subForm.fields, (f) => {
         return f.name === siblingFieldName;
       });
       return refField;
     };
     extendObservable(field, { error: ''});
     field.onChange = action((e) => {
       this.updateFieldValue(field, e.currentTarget.value);
     });
     field.onBlur = () => {
       this.validateForm();
     };
     if (field.type == 'checkbox') {
       field.onClick = action((e) => {
         this.updateFieldValue(field, e.currentTarget.checked);
       });
     } else if (field.type === 'number') {
       field.onValueChange = action((value) => {
         this.updateFieldValue(field, value);
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
   updateFieldValue(field, newValue) {
     field.value = newValue;
     if (field.refFields) {
       this.updateReferencedFields(field);
     }
     this.validateForm();
   }

   @action
   updateReferencedFields(field) {
     const { subForm } = field;
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

   validateForm() {
     if (!this.validationSchema) {
       throw (new Error('Validation Json schema is not set for the form.'));
     }
     if (!this.validateErrors) {
       const ajv = new Ajv({removeAdditional: true, $data: true, allErrors: true, jsonPointers: true});
       require('ajv-keywords')(ajv);
       require('ajv-errors')(ajv);
       this.validateErrors = ajv.compile(this.validationSchema);
     }

     if (this.formErrors) {
       for (const error of this.formErrors) {
         const errorPath = error.dataPath.substring(1, error.dataPath.lastIndexOf('.'));
         let field = _.at(this.formSchema, errorPath);
         if (field.length > 0 && field[0] === undefined || field[0] === null) {
           const schemaPath = error.schemaPath.substring(1, error.schemaPath.lastIndexOf('/')).replace(/\/properties\//g, '.').replace(/(\/items\/)(\d*)/, '[$2]').substr(1, error.schemaPath.length);
           field = _.at(this.formSchema, schemaPath);
         }
         if (field.length > 0 && field[0]) {
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

     if (errors) {
       for (const error of errors) {
         const errorPath = error.dataPath.substring(1, error.dataPath.lastIndexOf('.'));
         let field = _.at(this.formSchema, errorPath);
         if (field.length > 0 && field[0] === undefined || field[0] === null) {
           const schemaPath = error.schemaPath.substring(1, error.schemaPath.lastIndexOf('/')).replace(/\/properties\//g, '.').replace(/(\/items\/)(\d*)/, '[$2]').substr(1, error.schemaPath.length);
           field = _.at(this.formSchema, schemaPath);
         }
         if (field.length > 0 && field[0]) {
           runInAction(() => {
             field[0].error = error.message;
           });
         }
       }
       this.formErrors = errors;
     }
     runInAction(() => { this.isFormInvalid = !(this.formErrors && this.formErrors.length <= 0); });
     return {status, formData};
   }
 }
